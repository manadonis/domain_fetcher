const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Domain = require('../models/Domain');
const User = require('../models/User');

// GET /api/reports/export
// Export domain analysis data
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'csv', timeframe = '30d' } = req.query;
    const userId = req.user.id;

    // Check user's export limits
    const user = await User.findById(userId);
    const exportLimit = user.subscription?.limits?.exports || 2;
    const currentExports = user.usage?.exports || 0;

    if (currentExports >= exportLimit) {
      return res.status(403).json({
        message: `Export limit reached. You can export ${exportLimit} reports per month.`,
        currentUsage: currentExports,
        limit: exportLimit
      });
    }

    // Calculate date range
    let startDate;
    switch (timeframe) {
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

    // Fetch user's domain analyses
    const domains = await Domain.find({
      analyzedBy: userId,
      analyzedAt: { $gte: startDate }
    }).sort({ analyzedAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Domain,Score,Availability,Estimated Value,Category,Analysis Date\n';
      const csvRows = domains.map(domain => {
        return [
          domain.domain,
          domain.scoring?.overall || 0,
          domain.availability?.isAvailable ? 'Available' : 'Taken',
          domain.valuation?.estimated || 0,
          domain.category || 'Uncategorized',
          domain.analyzedAt.toISOString().split('T')[0]
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      // Update export usage
      await User.findByIdAndUpdate(userId, {
        $inc: { 'usage.exports': 1 }
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="domain-analysis-${timeframe}.csv"`);
      res.send(csvContent);

    } else if (format === 'json') {
      // Update export usage
      await User.findByIdAndUpdate(userId, {
        $inc: { 'usage.exports': 1 }
      });

      res.json({
        timeframe,
        exportDate: new Date().toISOString(),
        totalDomains: domains.length,
        domains: domains.map(domain => ({
          domain: domain.domain,
          score: domain.scoring?.overall || 0,
          availability: domain.availability?.isAvailable,
          estimatedValue: domain.valuation?.estimated,
          category: domain.category,
          analysisDate: domain.analyzedAt
        }))
      });

    } else {
      return res.status(400).json({
        message: 'Unsupported format. Use csv or json.'
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      message: 'Failed to export data',
      error: error.message
    });
  }
});

// GET /api/reports/summary
// Get analysis summary report
router.get('/summary', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const userId = req.user.id;

    // Calculate date range
    let startDate;
    switch (timeframe) {
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

    // Aggregate analysis data
    const summary = await Domain.aggregate([
      {
        $match: {
          analyzedBy: userId,
          analyzedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          avgScore: { $avg: '$scoring.overall' },
          highScoreCount: {
            $sum: { $cond: [{ $gte: ['$scoring.overall', 80] }, 1, 0] }
          },
          availableCount: {
            $sum: { $cond: ['$availability.isAvailable', 1, 0] }
          },
          totalEstimatedValue: { $sum: '$valuation.estimated' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    // Get top performing domains
    const topDomains = await Domain.find({
      analyzedBy: userId,
      analyzedAt: { $gte: startDate }
    })
    .sort({ 'scoring.overall': -1 })
    .limit(10)
    .select('domain scoring.overall valuation.estimated availability.isAvailable');

    const result = summary[0] || {
      totalAnalyses: 0,
      avgScore: 0,
      highScoreCount: 0,
      availableCount: 0,
      totalEstimatedValue: 0,
      categories: []
    };

    res.json({
      timeframe,
      reportDate: new Date().toISOString(),
      summary: {
        totalAnalyses: result.totalAnalyses,
        averageScore: Math.round(result.avgScore || 0),
        highScoreCount: result.highScoreCount,
        availableCount: result.availableCount,
        availabilityRate: result.totalAnalyses > 0
          ? Math.round((result.availableCount / result.totalAnalyses) * 100)
          : 0,
        totalEstimatedValue: result.totalEstimatedValue || 0,
        uniqueCategories: result.categories.filter(Boolean).length
      },
      topDomains
    });

  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({
      message: 'Failed to generate summary report',
      error: error.message
    });
  }
});

// GET /api/reports/usage
// Get usage report for current billing period
router.get('/usage', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Get current billing period start
    const billingStart = new Date();
    billingStart.setDate(1);
    billingStart.setHours(0, 0, 0, 0);

    // Count usage for current period
    const currentPeriodAnalyses = await Domain.countDocuments({
      analyzedBy: userId,
      analyzedAt: { $gte: billingStart }
    });

    const limits = user.subscription?.limits || {
      searches: 50,
      analyses: 10,
      exports: 2
    };

    const usage = {
      searches: user.usage?.searches || 0,
      analyses: currentPeriodAnalyses,
      exports: user.usage?.exports || 0
    };

    const usagePercentages = {
      searches: Math.round((usage.searches / limits.searches) * 100),
      analyses: Math.round((usage.analyses / limits.analyses) * 100),
      exports: Math.round((usage.exports / limits.exports) * 100)
    };

    res.json({
      billingPeriod: {
        start: billingStart.toISOString(),
        end: new Date(billingStart.getFullYear(), billingStart.getMonth() + 1, 0).toISOString()
      },
      plan: user.subscription?.plan || 'free',
      limits,
      usage,
      usagePercentages,
      overages: {
        searches: Math.max(0, usage.searches - limits.searches),
        analyses: Math.max(0, usage.analyses - limits.analyses),
        exports: Math.max(0, usage.exports - limits.exports)
      }
    });

  } catch (error) {
    console.error('Usage report error:', error);
    res.status(500).json({
      message: 'Failed to generate usage report',
      error: error.message
    });
  }
});

module.exports = router;