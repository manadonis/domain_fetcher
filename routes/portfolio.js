const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Domain = require('../models/Domain');

// GET /api/portfolio/portfolios
// Get user's portfolios
router.get('/portfolios', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('portfolios.domains');

    const portfolios = user.portfolios || [];

    res.json(portfolios);
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
});

// POST /api/portfolio/portfolios
// Create a new portfolio
router.post('/portfolios', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Portfolio name is required' });
    }

    const user = await User.findById(req.user.id);

    const newPortfolio = {
      name: name.trim(),
      description: description || '',
      domains: [],
      createdAt: new Date()
    };

    user.portfolios = user.portfolios || [];
    user.portfolios.push(newPortfolio);

    await user.save();

    const createdPortfolio = user.portfolios[user.portfolios.length - 1];

    res.status(201).json(createdPortfolio);
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
});

// GET /api/portfolio/watchlist
// Get user's watchlist
router.get('/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const watchlist = user.watchlist || [];

    res.json(watchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      message: 'Failed to fetch watchlist',
      error: error.message
    });
  }
});

// POST /api/portfolio/watchlist
// Add domain to watchlist
router.post('/watchlist', auth, async (req, res) => {
  try {
    const { domain, price } = req.body;

    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    const user = await User.findById(req.user.id);

    // Check if domain already in watchlist
    const existingIndex = user.watchlist.findIndex(item => item.domain === domain);

    if (existingIndex !== -1) {
      return res.status(400).json({ message: 'Domain already in watchlist' });
    }

    const watchlistItem = {
      domain,
      price: price || 0,
      addedAt: new Date(),
      isAvailable: true, // Default, should be checked
      currentScore: 0 // Default, should be analyzed
    };

    user.watchlist = user.watchlist || [];
    user.watchlist.push(watchlistItem);

    await user.save();

    const addedItem = user.watchlist[user.watchlist.length - 1];

    res.status(201).json(addedItem);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      message: 'Failed to add domain to watchlist',
      error: error.message
    });
  }
});

// DELETE /api/portfolio/watchlist/:domainId
// Remove domain from watchlist
router.delete('/watchlist/:domainId', auth, async (req, res) => {
  try {
    const { domainId } = req.params;

    const user = await User.findById(req.user.id);

    user.watchlist = user.watchlist.filter(item => item._id.toString() !== domainId);

    await user.save();

    res.json({ message: 'Domain removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      message: 'Failed to remove domain from watchlist',
      error: error.message
    });
  }
});

// DELETE /api/portfolio/portfolios/:portfolioId
// Delete a portfolio
router.delete('/portfolios/:portfolioId', auth, async (req, res) => {
  try {
    const { portfolioId } = req.params;

    const user = await User.findById(req.user.id);

    user.portfolios = user.portfolios.filter(portfolio => portfolio._id.toString() !== portfolioId);

    await user.save();

    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
});

module.exports = router;