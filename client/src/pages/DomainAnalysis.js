import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const DomainAnalysis = () => {
  const { domainName } = useParams();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);

  useEffect(() => {
    if (domainName) {
      fetchDomainAnalysis();
    }
  }, [domainName]);

  const fetchDomainAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/domains/analyze', {
        domain: domainName
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error('Domain analysis error:', error);
      setError(error.response?.data?.message || 'Failed to analyze domain');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToWatchlist(true);
    try {
      await api.post('/user/watchlist', {
        domain: domainName,
        price: analysis?.valuation?.estimated || 0
      });
      // Show success notification
      alert('Domain added to watchlist!');
    } catch (error) {
      console.error('Add to watchlist error:', error);
      alert('Failed to add domain to watchlist');
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Analyzing {domainName}...
          </p>
        </div>
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
            Analysis Failed
          </h2>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Search
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {domainName}
              </h1>
              <p className={`mt-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Comprehensive domain analysis and insights
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={addToWatchlist}
                disabled={isAddingToWatchlist || !user}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
              >
                {isAddingToWatchlist ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  '+ Add to Watchlist'
                )}
              </button>
              <button
                onClick={() => navigate('/search')}
                className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                New Search
              </button>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Score */}
              <div className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h2 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Overall Score
                </h2>
                <div className="flex items-center space-x-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    getScoreBgColor(analysis.scoring?.overall || 0)
                  }`}>
                    <span className={`text-2xl font-bold ${
                      getScoreColor(analysis.scoring?.overall || 0)
                    }`}>
                      {analysis.scoring?.overall || 0}
                    </span>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {analysis.scoring?.overall >= 80 ? 'Excellent' :
                       analysis.scoring?.overall >= 60 ? 'Good' : 'Fair'}
                    </p>
                    <p className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Based on multiple factors including length, keywords, and market value
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Scoring */}
              <div className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h2 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Detailed Scoring
                </h2>
                <div className="space-y-4">
                  {analysis.scoring && Object.entries(analysis.scoring).map(([key, value]) => {
                    if (key === 'overall') return null;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className={`capitalize ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                value >= 80 ? 'bg-green-500' :
                                value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEO Metrics */}
              {analysis.seoMetrics && (
                <div className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                  <h2 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    SEO Metrics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {analysis.seoMetrics.domainAuthority || 'N/A'}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Domain Authority
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {analysis.seoMetrics.backlinks || '0'}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Backlinks
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {analysis.seoMetrics.organicTraffic || '0'}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Organic Traffic
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {analysis.seoMetrics.keywords || '0'}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Keywords
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability */}
              <div className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h3 className={`text-lg font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Availability
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    analysis.availability?.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {analysis.availability?.isAvailable ? 'Available' : 'Taken'}
                  </span>
                </div>
                {analysis.availability?.confidence && (
                  <p className={`text-sm mt-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Confidence: {(analysis.availability.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>

              {/* Valuation */}
              {analysis.valuation && (
                <div className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                  <h3 className={`text-lg font-bold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Estimated Value
                  </h3>
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${analysis.valuation.estimated?.toLocaleString() || 'N/A'}
                  </p>
                  {analysis.valuation.range && (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Range: ${analysis.valuation.range.min?.toLocaleString()} -
                      ${analysis.valuation.range.max?.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Market Data */}
              {analysis.marketData && (
                <div className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                  <h3 className={`text-lg font-bold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Market Data
                  </h3>
                  <div className="space-y-2">
                    {analysis.marketData.listings && (
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Marketplace Listings: {analysis.marketData.listings.length}
                      </p>
                    )}
                    {analysis.marketData.similarSales && (
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Similar Sales: {analysis.marketData.similarSales.length}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Info */}
              <div className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h3 className={`text-lg font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Technical Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Length:
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {domainName.split('.')[0].length} characters
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Extension:
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      .{domainName.split('.').pop()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Hyphens:
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {(domainName.match(/-/g) || []).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainAnalysis;