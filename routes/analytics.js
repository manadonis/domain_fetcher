const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Domain = require('../models/Domain');
const User = require('../models/User');

// GET /api/analytics/dashboard
// Get user dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's domain analysis history
    const recentAnalyses = await Domain.find({ analyzedBy: userId })
      .sort({ analyzedAt: -1 })
      .limit(10)
      .select('domain scoring valuation availability analyzedAt');

    // Calculate usage statistics for the current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyAnalyses = await Domain.countDocuments({
      analyzedBy: userId,
      analyzedAt: { $gte: currentMonth }
    });

    // Get user's usage limits
    const user = await User.findById(userId).select('subscription usage');
    const limits = user.subscription?.limits || {
      searches: 50,
      analyses: 10,
      exports: 2
    };

    const usageData = {
      searches: user.usage?.searches || 0,
      analyses: monthlyAnalyses,
      exports: user.usage?.exports || 0
    };

    // Calculate analytics metrics
    const analytics = {
      totalAnalyses: recentAnalyses.length,
      averageScore: recentAnalyses.length > 0
        ? Math.round(recentAnalyses.reduce((sum, domain) => sum + (domain.scoring?.overall || 0), 0) / recentAnalyses.length)
        : 0,
      availableDomains: recentAnalyses.filter(d => d.availability?.isAvailable).length,
      highValueDomains: recentAnalyses.filter(d => (d.valuation?.estimated || 0) > 10000).length
    };

    res.json({
      recentAnalyses,
      usageData,
      limits,
      analytics
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
});

// GET /api/analytics/usage
// Get detailed usage analytics
router.get('/usage', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get usage data over time
    const dailyUsage = await Domain.aggregate([
      {
        $match: {
          analyzedBy: userId,
          analyzedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' }
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$scoring.overall' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      period,
      dailyUsage,
      totalAnalyses: dailyUsage.reduce((sum, day) => sum + day.count, 0)
    });

  } catch (error) {
    console.error('Usage analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch usage analytics',
      error: error.message
    });
  }
});

module.exports = router;