import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Marketplace = () => {
  const { isDarkMode } = useTheme();

  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    tld: '',
    minPrice: '',
    maxPrice: '',
    minScore: '',
    category: '',
    sortBy: 'score'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    'Food & Beverage'
  ];

  const tlds = ['.com', '.net', '.org', '.io', '.co', '.ai', '.tech', '.app'];

  useEffect(() => {
    fetchMarketplaceListings();
  }, [filters, currentPage]);

  const fetchMarketplaceListings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/marketplace/listings', {
        params: {
          ...filters,
          page: currentPage,
          limit: 20
        }
      });

      setListings(response.data.listings || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error);
      setError('Failed to load marketplace listings');

      // Mock data for demonstration when API fails
      setListings([
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
      ]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      tld: '',
      minPrice: '',
      maxPrice: '',
      minScore: '',
      category: '',
      sortBy: 'score'
    });
    setCurrentPage(1);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Domain Marketplace
          </h1>
          <p className={`mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Discover premium domains for sale from verified sellers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg sticky top-8`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* TLD Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Domain Extension
                  </label>
                  <select
                    value={filters.tld}
                    onChange={(e) => handleFilterChange('tld', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">All Extensions</option>
                    {tlds.map(tld => (
                      <option key={tld} value={tld}>{tld}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Min Score Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Minimum Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={filters.minScore}
                    onChange={(e) => handleFilterChange('minScore', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="score">Highest Score</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="length">Shortest Domain</option>
                    <option value="newest">Newest Listings</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : listings.length === 0 ? (
              <div className={`text-center py-12 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl`}>
                <div className="text-6xl mb-4">🏪</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No Domains Found
                </h3>
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Try adjusting your filters to find more domains
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results Count */}
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Showing {listings.length} domains
                </div>

                {/* Domain Listings */}
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className={`p-6 rounded-xl transition-all duration-200 hover:shadow-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } shadow-lg border ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-xl font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {listing.domain}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getScoreBadgeColor(listing.score)
                            }`}>
                              Score: {listing.score}/100
                            </span>
                            {listing.category && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {listing.category}
                              </span>
                            )}
                          </div>
                          <p className={`${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          } mb-3`}>
                            {listing.description}
                          </p>
                          {listing.seller && (
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Sold by: {listing.seller}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${listing.price.toLocaleString()}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Link
                              to={`/analysis/${listing.domain}`}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                            >
                              Analyze
                            </Link>
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200">
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      {listing.features && listing.features.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {listing.features.map((feature, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-xs ${
                                  isDarkMode
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                ✓ {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analytics */}
                      {listing.analytics && (
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <p className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {listing.analytics.monthlySearches?.toLocaleString() || 'N/A'}
                            </p>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Monthly Searches
                            </p>
                          </div>
                          <div className="text-center">
                            <p className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {listing.analytics.domainAuthority || 'N/A'}
                            </p>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Domain Authority
                            </p>
                          </div>
                          <div className="text-center">
                            <p className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {listing.analytics.backlinks?.toLocaleString() || 'N/A'}
                            </p>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Backlinks
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 border rounded-lg transition-colors duration-200 ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-lg transition-colors duration-200 ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 border rounded-lg transition-colors duration-200 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;