import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Pricing = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started with domain research',
      features: [
        '50 domain searches per month',
        '10 domain analyses per month',
        '2 CSV exports per month',
        'Basic search filters',
        'Domain availability checking',
        'Basic SEO metrics',
        'Community support'
      ],
      limitations: [
        'No bulk analysis',
        'No advanced search',
        'No marketplace data',
        'No API access'
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/register',
      popular: false
    },
    {
      name: 'Basic',
      price: { monthly: 29, annual: 290 },
      description: 'Great for individual domain investors and small businesses',
      features: [
        '500 domain searches per month',
        '100 domain analyses per month',
        '20 CSV exports per month',
        'Bulk domain analysis (up to 50)',
        'Advanced search filters',
        'Complete SEO metrics suite',
        'Portfolio management',
        'Watchlist tracking',
        'Email support'
      ],
      limitations: [
        'No marketplace integration',
        'No API access',
        'No priority support'
      ],
      buttonText: 'Choose Basic',
      buttonLink: '/subscribe/basic',
      popular: false
    },
    {
      name: 'Professional',
      price: { monthly: 99, annual: 990 },
      description: 'Ideal for domain professionals and growing businesses',
      features: [
        '5,000 domain searches per month',
        '1,000 domain analyses per month',
        '100 CSV exports per month',
        'Unlimited bulk analysis',
        'All advanced search features',
        'Full marketplace integration',
        'Historical sales data',
        'Competitor analysis',
        'API access (1,000 calls/month)',
        'Priority email support',
        'Team collaboration (up to 5 users)'
      ],
      limitations: [
        'Limited API calls',
        'No custom integrations'
      ],
      buttonText: 'Choose Professional',
      buttonLink: '/subscribe/professional',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 299, annual: 2990 },
      description: 'For large organizations and domain investment firms',
      features: [
        'Unlimited domain searches',
        'Unlimited domain analyses',
        'Unlimited CSV exports',
        'Unlimited bulk analysis',
        'All Professional features',
        'Unlimited API access',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager',
        'Phone & priority support',
        'Unlimited team members',
        'Advanced analytics & reporting',
        'Custom training sessions'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      buttonLink: '/contact-sales',
      popular: false
    }
  ];

  const getPrice = (plan) => {
    const price = isAnnual ? plan.price.annual : plan.price.monthly;
    if (price === 0) return 'Free';

    if (isAnnual) {
      const monthlyEquivalent = Math.round(price / 12);
      return `$${monthlyEquivalent}/mo`;
    }

    return `$${price}/mo`;
  };

  const getAnnualSavings = (plan) => {
    if (plan.price.monthly === 0) return 0;
    const annualMonthly = plan.price.annual / 12;
    const savings = plan.price.monthly - annualMonthly;
    return Math.round(savings);
  };

  const faq = [
    {
      question: 'What happens when I exceed my plan limits?',
      answer: 'When you approach your limits, we\'ll notify you via email. You can upgrade your plan at any time or wait for your limits to reset at the start of the next billing cycle.'
    },
    {
      question: 'Can I change my plan at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us within 30 days for a full refund.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via wire transfer or ACH.'
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Our Free plan serves as a trial for our service. You can start with the Free plan and upgrade when you need additional features and higher limits.'
    },
    {
      question: 'How accurate is your domain analysis?',
      answer: 'Our analysis combines multiple data sources and AI algorithms to provide highly accurate results. We continuously update our models based on market trends and user feedback.'
    }
  ];

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-4xl sm:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Simple, Transparent Pricing
            </h1>
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Choose the perfect plan for your domain intelligence needs.
              Upgrade or downgrade at any time.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-3 ${
                !isAnnual ? 'font-semibold' : ''
              } ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
                  isAnnual ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${
                isAnnual ? 'font-semibold' : ''
              } ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Annual
              </span>
              {isAnnual && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Save up to 17%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl transition-all duration-200 hover:shadow-2xl ${
                plan.popular
                  ? isDarkMode
                    ? 'bg-gradient-to-b from-blue-900 to-purple-900 border-2 border-blue-500'
                    : 'bg-gradient-to-b from-blue-50 to-purple-50 border-2 border-blue-500'
                  : isDarkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
              } shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getPrice(plan)}
                </div>
                {isAnnual && plan.price.monthly > 0 && (
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Save ${getAnnualSavings(plan)}/month
                  </div>
                )}
                <p className={`mt-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className={`font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  What's included:
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="mb-8">
                  <h4 className={`font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Limitations:
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Link
                to={plan.buttonLink}
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                    : isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.buttonText}
              </Link>

              {user && user.subscription?.plan === plan.name.toLowerCase() && (
                <div className="mt-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? 'bg-green-900 text-green-200'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Current Plan
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`py-20 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xl ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="space-y-6">
            {faq.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.question}
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Need a Custom Solution?
          </h2>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            We offer custom enterprise solutions for large organizations with specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Contact Sales
            </Link>
            <Link
              to="/demo"
              className={`px-8 py-3 font-semibold rounded-lg border-2 transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;