const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('../middleware/rateLimit');

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    interval: 'month',
    features: {
      searches: 50,
      analyses: 10,
      exports: 2,
      bulkAnalysis: false,
      advancedSearch: false,
      marketplaceAccess: false,
      apiAccess: false,
      priority: false
    },
    description: 'Perfect for getting started with domain analysis'
  },
  basic: {
    id: 'price_basic_monthly', // Stripe price ID
    name: 'Basic Plan',
    price: 29,
    interval: 'month',
    features: {
      searches: 500,
      analyses: 100,
      exports: 20,
      bulkAnalysis: true,
      advancedSearch: true,
      marketplaceAccess: false,
      apiAccess: false,
      priority: false
    },
    description: 'Great for individual domain investors'
  },
  professional: {
    id: 'price_pro_monthly', // Stripe price ID
    name: 'Professional Plan',
    price: 99,
    interval: 'month',
    features: {
      searches: 5000,
      analyses: 1000,
      exports: 100,
      bulkAnalysis: true,
      advancedSearch: true,
      marketplaceAccess: true,
      apiAccess: true,
      priority: true
    },
    description: 'Perfect for professional domain investors and agencies'
  },
  enterprise: {
    id: 'price_enterprise_monthly', // Stripe price ID
    name: 'Enterprise Plan',
    price: 299,
    interval: 'month',
    features: {
      searches: -1, // unlimited
      analyses: -1, // unlimited
      exports: -1, // unlimited
      bulkAnalysis: true,
      advancedSearch: true,
      marketplaceAccess: true,
      apiAccess: true,
      priority: true,
      customIntegrations: true,
      dedicatedSupport: true
    },
    description: 'Unlimited access for large organizations'
  }
};

// @route   GET /api/subscription/plans
// @desc    Get all subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.values(SUBSCRIPTION_PLANS),
    currency: 'usd'
  });
});

// @route   GET /api/subscription/current
// @desc    Get current user subscription
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    const user = req.user;
    const currentPlan = SUBSCRIPTION_PLANS[user.subscription.plan] || SUBSCRIPTION_PLANS.free;

    let stripeSubscription = null;
    if (user.subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        );
      } catch (error) {
        console.error('Error retrieving Stripe subscription:', error);
      }
    }

    res.json({
      plan: currentPlan,
      subscription: {
        ...user.subscription.toObject(),
        stripeData: stripeSubscription
      },
      usage: user.usage
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      error: 'Failed to get subscription',
      message: error.message
    });
  }
});

// @route   POST /api/subscription/create-checkout-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout-session',
  auth,
  rateLimit.sensitive,
  [
    body('planId')
      .isIn(['basic', 'professional', 'enterprise'])
      .withMessage('Invalid plan ID'),
    body('successUrl')
      .isURL()
      .withMessage('Valid success URL required'),
    body('cancelUrl')
      .isURL()
      .withMessage('Valid cancel URL required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { planId, successUrl, cancelUrl } = req.body;
      const user = req.user;

      // Get plan details
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return res.status(400).json({
          error: 'Invalid plan',
          message: 'The selected plan does not exist'
        });
      }

      // Create or get Stripe customer
      let customer;
      if (user.subscription.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user._id.toString()
          }
        });

        // Save customer ID
        user.subscription.stripeCustomerId = customer.id;
        await user.save();
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId: user._id.toString(),
          planId: planId
        },
        subscription_data: {
          metadata: {
            userId: user._id.toString(),
            planId: planId
          }
        }
      });

      res.json({
        sessionId: session.id,
        url: session.url
      });

    } catch (error) {
      console.error('Checkout session error:', error);
      res.status(500).json({
        error: 'Failed to create checkout session',
        message: error.message
      });
    }
  }
);

// @route   POST /api/subscription/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Webhook handler failed',
      message: error.message
    });
  }
});

// @route   POST /api/subscription/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel',
  auth,
  rateLimit.sensitive,
  async (req, res) => {
    try {
      const user = req.user;

      if (!user.subscription.stripeSubscriptionId) {
        return res.status(400).json({
          error: 'No active subscription',
          message: 'You do not have an active subscription to cancel'
        });
      }

      // Cancel at period end to allow user to use remaining time
      const subscription = await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );

      // Update user record
      user.subscription.cancelAtPeriodEnd = true;
      await user.save();

      res.json({
        message: 'Subscription will be canceled at the end of the current period',
        subscription: {
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });

    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        error: 'Failed to cancel subscription',
        message: error.message
      });
    }
  }
);

// @route   POST /api/subscription/reactivate
// @desc    Reactivate canceled subscription
// @access  Private
router.post('/reactivate',
  auth,
  rateLimit.sensitive,
  async (req, res) => {
    try {
      const user = req.user;

      if (!user.subscription.stripeSubscriptionId || !user.subscription.cancelAtPeriodEnd) {
        return res.status(400).json({
          error: 'No canceled subscription',
          message: 'You do not have a canceled subscription to reactivate'
        });
      }

      // Reactivate subscription
      const subscription = await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false
        }
      );

      // Update user record
      user.subscription.cancelAtPeriodEnd = false;
      await user.save();

      res.json({
        message: 'Subscription reactivated successfully',
        subscription: {
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });

    } catch (error) {
      console.error('Reactivate subscription error:', error);
      res.status(500).json({
        error: 'Failed to reactivate subscription',
        message: error.message
      });
    }
  }
);

// @route   GET /api/subscription/invoices
// @desc    Get user invoices
// @access  Private
router.get('/invoices', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.subscription.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: user.subscription.stripeCustomerId,
      limit: 20
    });

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status,
      date: new Date(invoice.created * 1000),
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url
    }));

    res.json({ invoices: formattedInvoices });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      error: 'Failed to get invoices',
      message: error.message
    });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const planId = session.metadata.planId;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update user subscription
  user.subscription = {
    ...user.subscription,
    plan: planId,
    status: 'active',
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: false
  };

  await user.save();
  console.log(`Subscription activated for user ${userId}: ${planId}`);
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
  if (!user) {
    console.error(`User not found for subscription: ${subscriptionId}`);
    return;
  }

  // Reset usage for new billing period
  const now = new Date();
  const lastReset = new Date(user.usage.lastResetDate);

  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    user.usage.monthlySearches = 0;
    user.usage.monthlyAnalyses = 0;
    user.usage.monthlyExports = 0;
    user.usage.lastResetDate = now;
  }

  // Update subscription status
  user.subscription.status = 'active';
  user.subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);

  await user.save();
  console.log(`Payment succeeded for user ${user._id}`);
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
  if (!user) {
    console.error(`User not found for subscription: ${subscriptionId}`);
    return;
  }

  // Update subscription status
  user.subscription.status = 'past_due';
  await user.save();

  // TODO: Send payment failed email notification
  console.log(`Payment failed for user ${user._id}`);
}

async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) {
    console.error(`User not found for subscription: ${subscription.id}`);
    return;
  }

  // Update subscription details
  user.subscription.status = subscription.status;
  user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // If plan changed, update plan
  if (subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    const planId = Object.keys(SUBSCRIPTION_PLANS).find(
      key => SUBSCRIPTION_PLANS[key].id === priceId
    );
    if (planId) {
      user.subscription.plan = planId;
    }
  }

  await user.save();
  console.log(`Subscription updated for user ${user._id}`);
}

async function handleSubscriptionCanceled(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) {
    console.error(`User not found for subscription: ${subscription.id}`);
    return;
  }

  // Downgrade to free plan
  user.subscription = {
    plan: 'free',
    status: 'inactive',
    stripeCustomerId: user.subscription.stripeCustomerId, // Keep customer ID
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false
  };

  await user.save();
  console.log(`Subscription canceled for user ${user._id}`);
}

module.exports = router;