const express = require('express');
const router = express.Router();
const ExternalAPIService = require('../services/ExternalAPIService');
const { query, validationResult } = require('express-validator');

const externalAPI = new ExternalAPIService();

// GET /api/marketplace/listings
// Get marketplace domain listings
router.get('/listings', [
  query('tld').optional().isString(),
  query('category').optional().isString(),
  query('minPrice').optional().isInt({ min: 0 }),
  query('maxPrice').optional().isInt({ min: 0 }),
  query('minScore').optional().isInt({ min: 0, max: 100 }),
  query('sortBy').optional().isIn(['score', 'price_asc', 'price_desc', 'length', 'newest']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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
      tld,
      category,
      minPrice,
      maxPrice,
      minScore,
      sortBy = 'score',
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      tld,
      category,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      minScore: minScore ? parseInt(minScore) : undefined,
      sortBy
    };

    // Mock marketplace data for now
    // In production, this would integrate with real marketplace APIs
    const mockListings = [
      {
        _id: '1',
        domain: 'techstartup.com',
        price: 15000,
        score: 95,
        category: 'Technology',
        description: 'Perfect for technology startups and innovation companies',
        seller: 'Premium Domains Inc.',
        features: ['Short & Memorable', 'High Commercial Value', 'SEO Friendly'],
        analytics: {
          monthlySearches: 12000,
          domainAuthority: 45,
          backlinks: 250
        }
      },
      {
        _id: '2',
        domain: 'aiinnovation.co',
        price: 8500,
        score: 88,
        category: 'Technology',
        description: 'Ideal domain for AI and machine learning companies',
        seller: 'TechDomains LLC',
        features: ['Trending Keywords', 'Modern TLD', 'Brand Potential'],
        analytics: {
          monthlySearches: 8900,
          domainAuthority: 38,
          backlinks: 180
        }
      },
      {
        _id: '3',
        domain: 'healthplus.net',
        price: 12000,
        score: 82,
        category: 'Health',
        description: 'Premium healthcare and wellness domain',
        seller: 'HealthDomains Pro',
        features: ['Healthcare Industry', 'Trust Building', 'Easy to Remember'],
        analytics: {
          monthlySearches: 15600,
          domainAuthority: 52,
          backlinks: 320
        }
      }
    ];

    // Apply basic filtering
    let filteredListings = mockListings;

    if (category) {
      filteredListings = filteredListings.filter(listing =>
        listing.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (minPrice) {
      filteredListings = filteredListings.filter(listing =>
        listing.price >= parseInt(minPrice)
      );
    }

    if (maxPrice) {
      filteredListings = filteredListings.filter(listing =>
        listing.price <= parseInt(maxPrice)
      );
    }

    if (minScore) {
      filteredListings = filteredListings.filter(listing =>
        listing.score >= parseInt(minScore)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filteredListings.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredListings.sort((a, b) => b.price - a.price);
        break;
      case 'length':
        filteredListings.sort((a, b) => a.domain.length - b.domain.length);
        break;
      case 'score':
      default:
        filteredListings.sort((a, b) => b.score - a.score);
        break;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedListings = filteredListings.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredListings.length / limitNum);

    res.json({
      listings: paginatedListings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalListings: filteredListings.length,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters
    });

  } catch (error) {
    console.error('Marketplace listings error:', error);
    res.status(500).json({
      message: 'Failed to fetch marketplace listings',
      error: error.message
    });
  }
});

// GET /api/marketplace/domain/:domain
// Get marketplace data for specific domain
router.get('/domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    const marketplaceData = await externalAPI.getMarketplaceListings(domain);

    res.json(marketplaceData);

  } catch (error) {
    console.error('Domain marketplace data error:', error);
    res.status(500).json({
      message: 'Failed to fetch domain marketplace data',
      error: error.message
    });
  }
});

// GET /api/marketplace/categories
// Get available marketplace categories
router.get('/categories', (req, res) => {
  const categories = [
    'Technology',
    'Business',
    'Finance',
    'Health',
    'Education',
    'E-commerce',
    'Entertainment',
    'Real Estate',
    'Travel',
    'Food & Beverage',
    'Sports',
    'Fashion',
    'Gaming',
    'News & Media',
    'Professional Services'
  ];

  res.json({ categories });
});

module.exports = router;