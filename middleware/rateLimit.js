const rateLimit = require('express-rate-limit');

// Create rate limiter with custom configuration
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Custom key generator to include user ID for authenticated requests
    keyGenerator: (req) => {
      if (req.user) {
        return `user_${req.user._id}`;
      }
      return req.ip;
    },

    // Custom handler for when limit is exceeded
    handler: (req, res) => {
      const resetTime = new Date(Date.now() + options.windowMs || 15 * 60 * 1000);

      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message?.message || 'Too many requests, please try again later.',
        limit: options.max || 100,
        windowMs: options.windowMs || 15 * 60 * 1000,
        resetTime: resetTime.toISOString(),
        retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000)
      });
    },

    // Skip rate limiting for certain conditions
    skip: (req) => {
      // Skip for health checks
      if (req.path === '/health') {
        return true;
      }

      // Skip for premium users (enterprise plan)
      if (req.user && req.user.subscription.plan === 'enterprise') {
        return true;
      }

      return false;
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Predefined rate limiters for different use cases
const rateLimiters = {
  // Standard API requests
  standard: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      message: 'Too many API requests, please try again later.'
    }
  }),

  // Strict rate limiting for resource-intensive operations
  strict: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
      message: 'Too many resource-intensive requests, please try again later.'
    }
  }),

  // Authentication endpoints
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Allow only 10 login attempts per 15 minutes
    message: {
      message: 'Too many authentication attempts, please try again later.'
    },
    skipSuccessfulRequests: true // Don't count successful requests
  }),

  // Domain analysis (most expensive operation)
  analysis: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: {
      message: 'Too many domain analysis requests, please try again later.'
    },
    // Different limits based on user plan
    keyGenerator: (req) => {
      if (req.user) {
        const plan = req.user.subscription.plan;
        return `analysis_${plan}_${req.user._id}`;
      }
      return `analysis_anonymous_${req.ip}`;
    },
    max: (req) => {
      if (!req.user) return 5; // Anonymous users get very limited access

      const plan = req.user.subscription.plan;
      const limits = {
        free: 10,
        basic: 25,
        professional: 50,
        enterprise: 1000
      };

      return limits[plan] || 5;
    }
  }),

  // Search endpoints
  search: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      if (!req.user) return 10;

      const plan = req.user.subscription.plan;
      const limits = {
        free: 25,
        basic: 100,
        professional: 300,
        enterprise: 1000
      };

      return limits[plan] || 10;
    },
    message: {
      message: 'Too many search requests, please try again later.'
    }
  }),

  // File upload/export endpoints
  upload: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
      message: 'Too many upload/export requests, please try again later.'
    }
  }),

  // Password reset and sensitive operations
  sensitive: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
      message: 'Too many sensitive operation requests, please try again later.'
    }
  })
};

// Middleware to check user subscription limits
const checkSubscriptionLimits = (actionType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to continue.'
      });
    }

    const user = req.user;

    // Check if user can perform the action
    if (!user.canPerformAction(actionType)) {
      const limits = {
        free: { searches: 50, analyses: 10, exports: 2 },
        basic: { searches: 500, analyses: 100, exports: 20 },
        professional: { searches: 5000, analyses: 1000, exports: 100 },
        enterprise: { searches: 'unlimited', analyses: 'unlimited', exports: 'unlimited' }
      };

      const userLimits = limits[user.subscription.plan] || limits.free;
      const currentUsage = user.usage[`monthly${actionType.charAt(0).toUpperCase() + actionType.slice(1)}s`];

      return res.status(429).json({
        error: 'Subscription limit exceeded',
        message: `You have reached your monthly ${actionType} limit.`,
        plan: user.subscription.plan,
        limit: userLimits[`${actionType}s`],
        used: currentUsage,
        upgradeRequired: true
      });
    }

    next();
  };
};

// IP-based rate limiter for anonymous users
const anonymousRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Very limited for anonymous users
  message: {
    message: 'Too many requests from anonymous user. Please register for higher limits.'
  },
  skip: (req) => !!req.user // Skip if user is authenticated
});

module.exports = {
  createRateLimit,
  checkSubscriptionLimits,
  anonymousRateLimit,
  ...rateLimiters
};

module.exports.default = createRateLimit;