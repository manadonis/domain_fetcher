const express = require('express');
const router = express.Router();
const DomainAnalysisService = require('../services/DomainAnalysisService');
const DomainSearchService = require('../services/DomainSearchService');
const Domain = require('../models/Domain');
const auth = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');
const { body, query, validationResult } = require('express-validator');

const analysisService = new DomainAnalysisService();
const searchService = new DomainSearchService();

// Rate limiting for different endpoints
const standardLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

const analysisLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // More restrictive for analysis
  message: 'Too many analysis requests, please try again later'
});

// Input validation middleware
const validateDomain = [
  body('domain')
    .isLength({ min: 4, max: 253 })
    .withMessage('Domain must be between 4 and 253 characters')
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/)
    .withMessage('Invalid domain format'),
];

const validateDomainList = [
  body('domains')
    .isArray({ min: 1, max: 100 })
    .withMessage('Domains must be an array with 1-100 items'),
  body('domains.*')
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/)
    .withMessage('Invalid domain format in list'),
];

const validateSearch = [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
    .trim()
    .escape(),
];

// @route   POST /api/domains/analyze
// @desc    Analyze a single domain
// @access  Private
router.post('/analyze',
  auth,
  analysisLimit,
  validateDomain,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { domain } = req.body;
      const user = req.user;

      // Check user limits
      if (!user.canPerformAction('analysis')) {
        return res.status(429).json({
          error: 'Analysis limit exceeded',
          message: 'Upgrade your plan for more analyses',
          plan: user.subscription.plan
        });
      }

      // Check if domain already exists in database
      let existingDomain = await Domain.findOne({ name: domain.toLowerCase() });

      if (existingDomain &&
          existingDomain.scoring.lastUpdated > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        // Return cached analysis if less than 24 hours old
        user.incrementUsage('analysis');
        await user.save();

        return res.json({
          domain: existingDomain,
          cached: true,
          lastUpdated: existingDomain.scoring.lastUpdated
        });
      }

      // Perform fresh analysis
      const analysis = await analysisService.analyzeDomain(domain);

      // Save or update domain in database
      if (existingDomain) {
        // Update existing domain
        existingDomain.availability = analysis.availability;
        existingDomain.whois = analysis.whoisData;
        existingDomain.scoring = {
          overall: analysis.scoring.overall,
          brevity: analysis.scoring.brevity,
          commercial: analysis.scoring.commercial,
          seo: analysis.scoring.seo,
          trend: analysis.scoring.trend,
          brandability: analysis.scoring.brandability,
          factors: analysis.scoring.factors,
          lastUpdated: new Date()
        };
        existingDomain.valuation = analysis.valuation;
        existingDomain.seo = analysis.seoMetrics;
        existingDomain.brand = analysis.brandAnalysis;
        existingDomain.market = analysis.marketIntelligence;
        existingDomain.technical = analysis.technicalAnalysis;
        existingDomain.ai = analysis.aiAnalysis;
        existingDomain.metadata.lastAnalyzedBy = user._id;
        existingDomain.metadata.analysisCount += 1;

        await existingDomain.save();
      } else {
        // Create new domain
        const basicInfo = analysisService.getBasicInfo(domain);
        existingDomain = new Domain({
          name: domain.toLowerCase(),
          tld: basicInfo.tld,
          baseName: basicInfo.baseName,
          availability: analysis.availability,
          whois: analysis.whoisData,
          scoring: {
            overall: analysis.scoring.overall,
            brevity: analysis.scoring.brevity,
            commercial: analysis.scoring.commercial,
            seo: analysis.scoring.seo,
            trend: analysis.scoring.trend,
            brandability: analysis.scoring.brandability,
            factors: analysis.scoring.factors,
            lastUpdated: new Date()
          },
          valuation: analysis.valuation,
          seo: analysis.seoMetrics,
          brand: analysis.brandAnalysis,
          market: analysis.marketIntelligence,
          technical: analysis.technicalAnalysis,
          ai: analysis.aiAnalysis,
          metadata: {
            source: 'api',
            createdBy: user._id,
            lastAnalyzedBy: user._id,
            analysisCount: 1
          }
        });

        await existingDomain.save();
      }

      // Update user usage
      user.incrementUsage('analysis');
      await user.save();

      res.json({
        domain: existingDomain,
        analysis: analysis,
        cached: false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Domain analysis error:', error);
      res.status(500).json({
        error: 'Analysis failed',
        message: error.message
      });
    }
  }
);

// @route   POST /api/domains/bulk-analyze
// @desc    Analyze multiple domains
// @access  Private
router.post('/bulk-analyze',
  auth,
  analysisLimit,
  validateDomainList,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { domains, options = {} } = req.body;
      const user = req.user;

      // Check user limits (bulk operations count as multiple analyses)
      const requiredAnalyses = domains.length;
      if (user.usage.monthlyAnalyses + requiredAnalyses > getLimitForPlan(user.subscription.plan, 'analyses')) {
        return res.status(429).json({
          error: 'Bulk analysis would exceed limit',
          required: requiredAnalyses,
          remaining: getLimitForPlan(user.subscription.plan, 'analyses') - user.usage.monthlyAnalyses,
          plan: user.subscription.plan
        });
      }

      // Perform bulk analysis
      const results = await analysisService.analyzeBulkDomains(domains, {
        maxConcurrency: 5,
        includeUnavailable: options.includeUnavailable || false
      });

      // Save results to database
      const savedDomains = [];
      for (const result of results) {
        if (!result.error) {
          try {
            const basicInfo = analysisService.getBasicInfo(result.domain);
            let domain = await Domain.findOne({ name: result.domain.toLowerCase() });

            if (domain) {
              domain.scoring = {
                overall: result.scoring.overall,
                brevity: result.scoring.brevity,
                commercial: result.scoring.commercial,
                seo: result.scoring.seo,
                trend: result.scoring.trend,
                brandability: result.scoring.brandability,
                factors: result.scoring.factors,
                lastUpdated: new Date()
              };
              domain.metadata.analysisCount += 1;
            } else {
              domain = new Domain({
                name: result.domain.toLowerCase(),
                tld: basicInfo.tld,
                baseName: basicInfo.baseName,
                availability: result.availability,
                scoring: {
                  overall: result.scoring.overall,
                  brevity: result.scoring.brevity,
                  commercial: result.scoring.commercial,
                  seo: result.scoring.seo,
                  trend: result.scoring.trend,
                  brandability: result.scoring.brandability,
                  factors: result.scoring.factors,
                  lastUpdated: new Date()
                },
                valuation: result.valuation,
                metadata: {
                  source: 'bulk_api',
                  createdBy: user._id,
                  analysisCount: 1
                }
              });
            }

            await domain.save();
            savedDomains.push(domain);
          } catch (saveError) {
            console.error(`Failed to save domain ${result.domain}:`, saveError);
          }
        }
      }

      // Update user usage
      user.usage.monthlyAnalyses += requiredAnalyses;
      user.usage.totalAnalyses += requiredAnalyses;
      await user.save();

      res.json({
        results: results,
        saved: savedDomains.length,
        total: domains.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Bulk analysis error:', error);
      res.status(500).json({
        error: 'Bulk analysis failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/domains/search
// @desc    Search and suggest domains
// @access  Private
router.get('/search',
  auth,
  standardLimit,
  validateSearch,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        q: query,
        industries = 'general',
        tlds,
        maxResults = 25,
        includeAnalysis = 'true',
        onlyAvailable = 'true',
        minScore = 5
      } = req.query;

      const user = req.user;

      // Check user limits
      if (!user.canPerformAction('search')) {
        return res.status(429).json({
          error: 'Search limit exceeded',
          message: 'Upgrade your plan for more searches',
          plan: user.subscription.plan
        });
      }

      const searchOptions = {
        maxResults: Math.min(parseInt(maxResults), 100),
        includeAnalysis: includeAnalysis === 'true',
        onlyAvailable: onlyAvailable === 'true',
        minScore: parseFloat(minScore),
        industries: industries.split(',').map(i => i.trim()),
        tlds: tlds ? tlds.split(',').map(t => t.trim()) : null
      };

      const results = await searchService.searchDomains(query, searchOptions);

      // Update user usage
      user.incrementUsage('search');
      await user.save();

      res.json({
        query,
        options: searchOptions,
        results: results.results,
        metadata: {
          totalGenerated: results.totalGenerated,
          totalAnalyzed: results.totalAnalyzed,
          searchTime: results.searchTime,
          timestamp: results.timestamp
        }
      });

    } catch (error) {
      console.error('Domain search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message
      });
    }
  }
);

// @route   POST /api/domains/advanced-search
// @desc    Advanced domain search with filters
// @access  Private
router.post('/advanced-search',
  auth,
  standardLimit,
  async (req, res) => {
    try {
      const user = req.user;

      // Check user limits (advanced search counts as premium feature)
      if (user.subscription.plan === 'free') {
        return res.status(403).json({
          error: 'Premium feature',
          message: 'Advanced search requires a paid plan'
        });
      }

      if (!user.canPerformAction('search')) {
        return res.status(429).json({
          error: 'Search limit exceeded',
          plan: user.subscription.plan
        });
      }

      const filters = req.body;
      const results = await searchService.advancedSearch(filters);

      // Update user usage
      user.incrementUsage('search');
      await user.save();

      res.json(results);

    } catch (error) {
      console.error('Advanced search error:', error);
      res.status(500).json({
        error: 'Advanced search failed',
        message: error.message
      });
    }
  }
);

// @route   POST /api/domains/generate-brandable
// @desc    Generate brandable domain names
// @access  Private
router.post('/generate-brandable',
  auth,
  standardLimit,
  async (req, res) => {
    try {
      const { concept, industries = ['general'], maxResults = 25 } = req.body;
      const user = req.user;

      if (!concept || concept.length < 2) {
        return res.status(400).json({
          error: 'Invalid concept',
          message: 'Concept must be at least 2 characters'
        });
      }

      // Check user limits
      if (!user.canPerformAction('search')) {
        return res.status(429).json({
          error: 'Search limit exceeded',
          plan: user.subscription.plan
        });
      }

      const suggestions = await searchService.generateBrandableNames(concept, {
        maxResults,
        industries
      });

      // Update user usage
      user.incrementUsage('search');
      await user.save();

      res.json({
        concept,
        industries,
        suggestions,
        count: suggestions.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Brandable generation error:', error);
      res.status(500).json({
        error: 'Brandable generation failed',
        message: error.message
      });
    }
  }
);

// @route   GET /api/domains/:domain
// @desc    Get domain details
// @access  Private
router.get('/:domain',
  auth,
  standardLimit,
  async (req, res) => {
    try {
      const domainName = req.params.domain.toLowerCase();

      const domain = await Domain.findOne({ name: domainName })
        .populate('metadata.createdBy', 'firstName lastName')
        .populate('metadata.lastAnalyzedBy', 'firstName lastName');

      if (!domain) {
        return res.status(404).json({
          error: 'Domain not found',
          message: 'Domain has not been analyzed yet'
        });
      }

      res.json({
        domain,
        cached: true,
        lastUpdated: domain.scoring.lastUpdated
      });

    } catch (error) {
      console.error('Get domain error:', error);
      res.status(500).json({
        error: 'Failed to retrieve domain',
        message: error.message
      });
    }
  }
);

// @route   POST /api/domains/:domain/watchlist
// @desc    Add domain to user's watchlist
// @access  Private
router.post('/:domain/watchlist',
  auth,
  standardLimit,
  async (req, res) => {
    try {
      const domainName = req.params.domain.toLowerCase();
      const user = req.user;

      let domain = await Domain.findOne({ name: domainName });

      if (!domain) {
        return res.status(404).json({
          error: 'Domain not found',
          message: 'Domain must be analyzed first'
        });
      }

      domain.addToWatchlist(user._id);
      await domain.save();

      res.json({
        message: 'Domain added to watchlist',
        domain: domainName,
        watchlistCount: domain.metadata.watchlist.length
      });

    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({
        error: 'Failed to add to watchlist',
        message: error.message
      });
    }
  }
);

// @route   DELETE /api/domains/:domain/watchlist
// @desc    Remove domain from user's watchlist
// @access  Private
router.delete('/:domain/watchlist',
  auth,
  standardLimit,
  async (req, res) => {
    try {
      const domainName = req.params.domain.toLowerCase();
      const user = req.user;

      let domain = await Domain.findOne({ name: domainName });

      if (!domain) {
        return res.status(404).json({
          error: 'Domain not found'
        });
      }

      domain.removeFromWatchlist(user._id);
      await domain.save();

      res.json({
        message: 'Domain removed from watchlist',
        domain: domainName,
        watchlistCount: domain.metadata.watchlist.length
      });

    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({
        error: 'Failed to remove from watchlist',
        message: error.message
      });
    }
  }
);

// Helper function to get limits for subscription plans
function getLimitForPlan(plan, actionType) {
  const limits = {
    free: { searches: 50, analyses: 10, exports: 2 },
    basic: { searches: 500, analyses: 100, exports: 20 },
    professional: { searches: 5000, analyses: 1000, exports: 100 },
    enterprise: { searches: -1, analyses: -1, exports: -1 } // unlimited
  };

  const planLimits = limits[plan] || limits.free;
  return planLimits[actionType] || 0;
}

module.exports = router;