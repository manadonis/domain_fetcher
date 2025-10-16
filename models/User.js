const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },

  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean,
    trialEnd: Date
  },

  // Usage Tracking
  usage: {
    monthlySearches: { type: Number, default: 0 },
    monthlyAnalyses: { type: Number, default: 0 },
    monthlyExports: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },

    // Lifetime stats
    totalSearches: { type: Number, default: 0 },
    totalAnalyses: { type: Number, default: 0 },
    totalExports: { type: Number, default: 0 }
  },

  // User Preferences
  preferences: {
    defaultTLDs: [{ type: String, default: ['.com', '.net', '.org'] }],
    notifications: {
      email: { type: Boolean, default: true },
      domainAlerts: { type: Boolean, default: true },
      marketUpdates: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false }
    },
    dashboard: {
      defaultView: { type: String, default: 'overview' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' }
    }
  },

  // Authentication & Security
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Account Status
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: String,

  // Timestamps
  lastLogin: Date,
  lastActivity: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check subscription limits
userSchema.methods.canPerformAction = function(actionType) {
  const limits = {
    free: { searches: 50, analyses: 10, exports: 2 },
    basic: { searches: 500, analyses: 100, exports: 20 },
    professional: { searches: 5000, analyses: 1000, exports: 100 },
    enterprise: { searches: -1, analyses: -1, exports: -1 } // unlimited
  };

  const userLimits = limits[this.subscription.plan];
  if (!userLimits) return false;

  // Check if it's a new month
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);

  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    // Reset monthly counters
    this.usage.monthlySearches = 0;
    this.usage.monthlyAnalyses = 0;
    this.usage.monthlyExports = 0;
    this.usage.lastResetDate = now;
  }

  // Check limits
  switch (actionType) {
    case 'search':
      return userLimits.searches === -1 || this.usage.monthlySearches < userLimits.searches;
    case 'analysis':
      return userLimits.analyses === -1 || this.usage.monthlyAnalyses < userLimits.analyses;
    case 'export':
      return userLimits.exports === -1 || this.usage.monthlyExports < userLimits.exports;
    default:
      return false;
  }
};

// Method to increment usage
userSchema.methods.incrementUsage = function(actionType) {
  switch (actionType) {
    case 'search':
      this.usage.monthlySearches += 1;
      this.usage.totalSearches += 1;
      break;
    case 'analysis':
      this.usage.monthlyAnalyses += 1;
      this.usage.totalAnalyses += 1;
      break;
    case 'export':
      this.usage.monthlyExports += 1;
      this.usage.totalExports += 1;
      break;
  }
  this.lastActivity = new Date();
};

module.exports = mongoose.model('User', userSchema);