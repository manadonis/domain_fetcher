import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredDomains, setFeaturedDomains] = useState([]);

  useEffect(() => {
    // Mock featured domains - in production this would come from API
    setFeaturedDomains([
      { name: 'techstartup.com', score: 95, price: '$15,000' },
      { name: 'aiinnovation.co', score: 88, price: '$8,500' },
      { name: 'cloudnative.io', score: 92, price: '$12,000' }
    ]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirect to search page with the search term
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const features = [
    {
      icon: '🔍',
      title: 'Smart Domain Search',
      description: 'AI-powered search that finds the perfect domains based on your business needs and preferences.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive domain analysis including SEO metrics, traffic estimates, and market valuation.'
    },
    {
      icon: '💰',
      title: 'Investment Intelligence',
      description: 'Market trends, pricing insights, and ROI calculations to make informed investment decisions.'
    },
    {
      icon: '🌐',
      title: 'Brand Protection',
      description: 'Monitor similar domains, trademark conflicts, and social media availability for your brand.'
    },
    {
      icon: '⚡',
      title: 'Real-time Data',
      description: 'Live availability checks, instant valuations, and up-to-date marketplace listings.'
    },
    {
      icon: '🛡️',
      title: 'Secure Platform',
      description: 'Enterprise-grade security with encrypted data storage and secure payment processing.'
    }
  ];

  const stats = [
    { label: 'Domains Analyzed', value: '2.5M+' },
    { label: 'Active Users', value: '50K+' },
    { label: 'Saved in Costs', value: '$10M+' },
    { label: 'Success Rate', value: '94%' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Find Your Perfect
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Domain Name
              </span>
            </h1>

            <p className={`text-xl sm:text-2xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Professional domain intelligence platform with AI-powered search,
              comprehensive analysis, and market insights for smart investments.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for domain names, keywords, or brands..."
                  className={`w-full px-6 py-4 text-lg rounded-xl border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/30'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/search"
                    className={`px-8 py-3 font-semibold rounded-lg border-2 transform hover:scale-105 transition-all duration-200 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Advanced Search
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className={`px-8 py-3 font-semibold rounded-lg border-2 transform hover:scale-105 transition-all duration-200 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-16 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Powerful Features for Domain Professionals
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need to find, analyze, and invest in domain names
              with confidence and precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Domains Section */}
      {featuredDomains.length > 0 && (
        <div className={`py-20 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Featured Premium Domains
              </h2>
              <p className={`text-xl ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Hand-picked domains with excellent potential
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredDomains.map((domain, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl transition-all duration-200 hover:shadow-xl ${
                    isDarkMode
                      ? 'bg-gray-900 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {domain.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Score: <span className="font-semibold text-green-500">{domain.score}/100</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {domain.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Find Your Perfect Domain?
          </h2>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of domain investors and businesses who trust our platform
            for their domain intelligence needs.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Your Free Trial
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;