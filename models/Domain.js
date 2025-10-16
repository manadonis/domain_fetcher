const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  // Basic Domain Information
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  tld: {
    type: String,
    required: true,
    index: true
  },
  baseName: {
    type: String,
    required: true,
    index: true
  },

  // Availability & Status
  availability: {
    isAvailable: { type: Boolean, default: null },
    lastChecked: Date,
    registrar: String,
    status: String // available, registered, premium, reserved, etc.
  },

  // WHOIS Information
  whois: {
    registrar: String,
    registeredDate: Date,
    expiryDate: Date,
    updatedDate: Date,
    nameservers: [String],
    registrantCountry: String,
    registrantOrg: String,
    privacy: Boolean,
    dnsSec: Boolean,
    status: [String] // clientDeleteProhibited, etc.
  },

  // Domain Scoring & Valuation
  scoring: {
    overall: { type: Number, min: 0, max: 10, index: true },
    brevity: { type: Number, min: 0, max: 10 },
    commercial: { type: Number, min: 0, max: 10 },
    seo: { type: Number, min: 0, max: 10 },
    trend: { type: Number, min: 0, max: 10 },
    brandability: { type: Number, min: 0, max: 10 },
    memorability: { type: Number, min: 0, max: 10 },

    // Detailed scoring factors
    factors: {
      length: Number,
      keywords: [String],
      trends: [String],
      industries: [String],
      pronounceability: Number,
      spellingDifficulty: Number,
      visualAppeal: Number
    },

    lastUpdated: { type: Date, default: Date.now }
  },

  // Valuation Data
  valuation: {
    estimatedValue: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    comparables: [{
      domain: String,
      salePrice: Number,
      saleDate: Date,
      marketplace: String,
      similarity: Number
    }],
    appraisalHistory: [{
      value: Number,
      date: Date,
      method: String,
      source: String
    }],
    lastUpdated: Date
  },

  // SEO & Traffic Metrics
  seo: {
    domainAuthority: Number,
    pageAuthority: Number,
    backlinks: {
      total: Number,
      dofollow: Number,
      nofollow: Number,
      uniqueDomains: Number,
      qualityScore: Number
    },
    keywords: [{
      keyword: String,
      position: Number,
      volume: Number,
      difficulty: Number,
      cpc: Number
    }],
    organicTraffic: {
      monthly: Number,
      trend: String, // increasing, decreasing, stable
      topPages: [String]
    },
    technicalSEO: {
      speedScore: Number,
      mobileOptimized: Boolean,
      httpsEnabled: Boolean,
      xmlSitemap: Boolean,
      robotsTxt: Boolean
    },
    lastUpdated: Date
  },

  // Historical Data
  history: {
    websites: [{
      title: String,
      description: String,
      category: String,
      captureDate: Date,
      screenshot: String,
      archived: Boolean
    }],
    salesHistory: [{
      price: Number,
      date: Date,
      marketplace: String,
      buyer: String,
      seller: String
    }],
    priceHistory: [{
      price: Number,
      date: Date,
      source: String,
      type: String // listing, sale, appraisal
    }],
    dropHistory: [{
      date: Date,
      reason: String,
      caughtBy: String
    }]
  },

  // Technical Analysis
  technical: {
    dns: {
      aRecords: [String],
      cnameRecords: [String],
      mxRecords: [String],
      txtRecords: [String],
      nsRecords: [String]
    },
    ssl: {
      hasSSL: Boolean,
      issuer: String,
      validFrom: Date,
      validTo: Date,
      grade: String
    },
    hosting: {
      provider: String,
      location: String,
      ipAddress: String,
      technology: [String]
    },
    performance: {
      loadTime: Number,
      pageSize: Number,
      requests: Number,
      lighthouse: {
        performance: Number,
        accessibility: Number,
        bestPractices: Number,
        seo: Number
      }
    }
  },

  // Market Intelligence
  market: {
    category: [String],
    industries: [String],
    targetAudience: [String],
    competitors: [String],
    trends: [String],
    seasonality: {
      peak: [String], // months
      low: [String]
    },
    demandScore: Number,
    liquidityScore: Number
  },

  // Social Media & Brand Analysis
  brand: {
    socialMedia: {
      twitter: { available: Boolean, username: String },
      facebook: { available: Boolean, username: String },
      instagram: { available: Boolean, username: String },
      linkedin: { available: Boolean, username: String },
      youtube: { available: Boolean, username: String },
      tiktok: { available: Boolean, username: String }
    },
    trademarks: [{
      keyword: String,
      status: String,
      jurisdiction: String,
      class: String,
      owner: String,
      registrationDate: Date
    }],
    brandability: {
      score: Number,
      factors: [String],
      logoSuggestions: [String]
    }
  },

  // Investment Analysis
  investment: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    holdingPeriod: String,
    expectedReturn: Number,
    parkingRevenue: Number,
    developmentPotential: Number,
    liquidityRating: Number,
    portfolioFit: [String]
  },

  // External References
  external: {
    auctionId: String,
    marketplace: String,
    listingUrl: String,
    auctionEndDate: Date,
    reservePrice: Number,
    currentBid: Number,
    bidCount: Number
  },

  // AI & ML Analysis
  ai: {
    sentiment: Number, // -1 to 1
    nameGenerator: {
      suggested: Boolean,
      algorithm: String,
      confidence: Number
    },
    clustering: {
      group: String,
      similarity: Number,
      neighbors: [String]
    },
    predictions: {
      futureValue: Number,
      trendDirection: String,
      confidenceLevel: Number,
      factors: [String]
    }
  },

  // Metadata
  metadata: {
    source: String, // manual, api, scraper, ai-generated
    tags: [String],
    notes: String,
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastAnalyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    analysisCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
domainSchema.index({ name: 1, tld: 1 });
domainSchema.index({ 'scoring.overall': -1 });
domainSchema.index({ 'valuation.estimatedValue.min': -1 });
domainSchema.index({ 'availability.isAvailable': 1, 'scoring.overall': -1 });
domainSchema.index({ 'market.category': 1 });
domainSchema.index({ createdAt: -1 });
domainSchema.index({ 'metadata.tags': 1 });

// Text index for search
domainSchema.index({
  name: 'text',
  'scoring.factors.keywords': 'text',
  'market.industries': 'text',
  'metadata.tags': 'text'
});

// Virtual for full domain name
domainSchema.virtual('fullName').get(function() {
  return `${this.baseName}.${this.tld}`;
});

// Virtual for estimated value range
domainSchema.virtual('valueRange').get(function() {
  if (this.valuation?.estimatedValue) {
    const { min, max, currency } = this.valuation.estimatedValue;
    return min && max ? `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}` : null;
  }
  return null;
});

// Method to update scoring
domainSchema.methods.updateScoring = function(newScoring) {
  this.scoring = { ...this.scoring, ...newScoring, lastUpdated: new Date() };
  this.metadata.analysisCount += 1;
};

// Method to add to watchlist
domainSchema.methods.addToWatchlist = function(userId) {
  if (!this.metadata.watchlist.includes(userId)) {
    this.metadata.watchlist.push(userId);
  }
};

// Method to remove from watchlist
domainSchema.methods.removeFromWatchlist = function(userId) {
  this.metadata.watchlist = this.metadata.watchlist.filter(id => !id.equals(userId));
};

// Static method to find similar domains
domainSchema.statics.findSimilar = function(baseName, limit = 10) {
  return this.find({
    $or: [
      { baseName: new RegExp(baseName, 'i') },
      { 'scoring.factors.keywords': { $in: [baseName] } }
    ]
  }).limit(limit);
};

// Static method for advanced search
domainSchema.statics.advancedSearch = function(filters) {
  const query = {};

  if (filters.available !== undefined) {
    query['availability.isAvailable'] = filters.available;
  }

  if (filters.minScore) {
    query['scoring.overall'] = { $gte: filters.minScore };
  }

  if (filters.maxScore) {
    query['scoring.overall'] = { ...query['scoring.overall'], $lte: filters.maxScore };
  }

  if (filters.tlds && filters.tlds.length > 0) {
    query.tld = { $in: filters.tlds };
  }

  if (filters.categories && filters.categories.length > 0) {
    query['market.category'] = { $in: filters.categories };
  }

  if (filters.minValue || filters.maxValue) {
    const valueQuery = {};
    if (filters.minValue) valueQuery.$gte = filters.minValue;
    if (filters.maxValue) valueQuery.$lte = filters.maxValue;
    query['valuation.estimatedValue.min'] = valueQuery;
  }

  if (filters.keywords) {
    query.$text = { $search: filters.keywords };
  }

  return this.find(query);
};

module.exports = mongoose.model('Domain', domainSchema);