const express = require('express');
const router = express.Router();
const DomainSearchService = require('../services/DomainSearchService');
const auth = require('../middleware/auth');
const { query, validationResult } = require('express-validator');

const searchService = new DomainSearchService();

// GET /api/search/suggestions
// Get domain search suggestions
router.get('/suggestions', [
  query('q').isLength({ min: 1 }).withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { q, limit = 10 } = req.query;

    const suggestions = await searchService.generateSuggestions(q, {
      limit: parseInt(limit)
    });

    res.json({
      query: q,
      suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      message: 'Failed to generate suggestions',
      error: error.message
    });
  }
});

// GET /api/search/brandable
// Generate brandable domain names
router.get('/brandable', [
  query('industry').optional().isString(),
  query('length').optional().isIn(['short', 'medium', 'long']),
  query('style').optional().isIn(['modern', 'classic', 'creative', 'minimal']),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      industry,
      length = 'short',
      style = 'modern',
      limit = 20
    } = req.query;

    const brandableOptions = {
      industry,
      length,
      style,
      limit: parseInt(limit)
    };

    const brandables = await searchService.generateBrandable(brandableOptions);

    res.json({
      options: brandableOptions,
      domains: brandables
    });

  } catch (error) {
    console.error('Brandable generation error:', error);
    res.status(500).json({
      message: 'Failed to generate brandable domains',
      error: error.message
    });
  }
});

// GET /api/search/similar
// Find similar domains
router.get('/similar', [
  query('domain').isString().withMessage('Domain is required'),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { domain, limit = 20 } = req.query;

    const similar = await searchService.findSimilar(domain, {
      limit: parseInt(limit)
    });

    res.json({
      baseDomain: domain,
      similar
    });

  } catch (error) {
    console.error('Similar domains error:', error);
    res.status(500).json({
      message: 'Failed to find similar domains',
      error: error.message
    });
  }
});

// GET /api/search/expired
// Find expired domains (requires premium features)
router.get('/expired', auth, [
  query('tld').optional().isString(),
  query('minDA').optional().isInt({ min: 0, max: 100 }),
  query('hasBacklinks').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    // Check user subscription level
    const user = req.user;
    if (!user.subscription || user.subscription.plan === 'free') {
      return res.status(403).json({
        message: 'Premium subscription required for expired domain search'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      tld,
      minDA,
      hasBacklinks,
      limit = 50
    } = req.query;

    const filters = {
      tld,
      minDA: minDA ? parseInt(minDA) : undefined,
      hasBacklinks: hasBacklinks === 'true',
      limit: parseInt(limit)
    };

    // This would integrate with expired domain services
    const expired = await searchService.findExpired(filters);

    res.json({
      filters,
      domains: expired
    });

  } catch (error) {
    console.error('Expired domains error:', error);
    res.status(500).json({
      message: 'Failed to find expired domains',
      error: error.message
    });
  }
});

module.exports = router;