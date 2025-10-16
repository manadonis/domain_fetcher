import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Portfolio = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [portfolios, setPortfolios] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState('portfolios');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [portfoliosResponse, watchlistResponse] = await Promise.all([
        api.get('/user/portfolios'),
        api.get('/user/watchlist')
      ]);

      setPortfolios(portfoliosResponse.data || []);
      setWatchlist(watchlistResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const createPortfolio = async () => {
    if (!newPortfolioName.trim()) return;

    setIsCreating(true);
    try {
      const response = await api.post('/user/portfolios', {
        name: newPortfolioName.trim(),
        description: `${newPortfolioName.trim()} portfolio`
      });

      setPortfolios(prev => [...prev, response.data]);
      setNewPortfolioName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      alert('Failed to create portfolio');
    } finally {
      setIsCreating(false);
    }
  };

  const removeFromWatchlist = async (domainId) => {
    try {
      await api.delete(`/user/watchlist/${domainId}`);
      setWatchlist(prev => prev.filter(item => item._id !== domainId));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      alert('Failed to remove from watchlist');
    }
  };

  const deletePortfolio = async (portfolioId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) return;

    try {
      await api.delete(`/user/portfolios/${portfolioId}`);
      setPortfolios(prev => prev.filter(p => p._id !== portfolioId));
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      alert('Failed to delete portfolio');
    }
  };

  const calculatePortfolioValue = (portfolio) => {
    return portfolio.domains?.reduce((total, domain) => {
      return total + (domain.purchasePrice || domain.currentValue || 0);
    }, 0) || 0;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Failed to Load Portfolio
          </h2>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <button
            onClick={fetchUserData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            Portfolio Management
          </h1>
          <p className={`mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage your domain investments and watchlist
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className={`border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('portfolios')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'portfolios'
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Portfolios ({portfolios.length})
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'watchlist'
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Watchlist ({watchlist.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Portfolios Tab */}
        {activeTab === 'portfolios' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Domain Portfolios
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                + Create Portfolio
              </button>
            </div>

            {portfolios.length === 0 ? (
              <div className={`text-center py-12 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl`}>
                <div className="text-6xl mb-4">📁</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No Portfolios Yet
                </h3>
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Create your first portfolio to organize your domain investments
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Your First Portfolio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio._id}
                    className={`p-6 rounded-xl transition-all duration-200 hover:shadow-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {portfolio.name}
                      </h3>
                      <button
                        onClick={() => deletePortfolio(portfolio._id)}
                        className={`text-red-500 hover:text-red-700 ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        } p-1 rounded`}
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          Domains:
                        </span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {portfolio.domains?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          Total Value:
                        </span>
                        <span className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${calculatePortfolioValue(portfolio).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/portfolio/${portfolio._id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      View Portfolio
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div>
            <h2 className={`text-xl font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Domain Watchlist
            </h2>

            {watchlist.length === 0 ? (
              <div className={`text-center py-12 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl`}>
                <div className="text-6xl mb-4">👀</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No Domains in Watchlist
                </h3>
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Add domains to your watchlist to track their availability and value
                </p>
                <Link
                  to="/search"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Search Domains
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {watchlist.map((item) => (
                  <div
                    key={item._id}
                    className={`p-6 rounded-xl flex justify-between items-center transition-all duration-200 hover:shadow-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-md`}
                  >
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.domain}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2">
                        {item.currentScore && (
                          <span className={`text-sm ${getScoreColor(item.currentScore)}`}>
                            Score: {item.currentScore}/100
                          </span>
                        )}
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Added: {new Date(item.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        {item.currentPrice && (
                          <p className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${item.currentPrice.toLocaleString()}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.isAvailable ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Taken'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/analysis/${item.domain}`}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                        >
                          Analyze
                        </Link>
                        <button
                          onClick={() => removeFromWatchlist(item._id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Portfolio Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Create New Portfolio
              </h3>

              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Portfolio name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPortfolioName('');
                  }}
                  className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={createPortfolio}
                  disabled={!newPortfolioName.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;