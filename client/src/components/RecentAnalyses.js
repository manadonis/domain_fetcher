import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const RecentAnalyses = ({ analyses = [], className = "" }) => {
  const { isDarkMode } = useTheme();

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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  // Mock data if no analyses provided
  const mockAnalyses = [
    {
      _id: '1',
      domain: 'techstartup.com',
      score: 95,
      availability: { isAvailable: false },
      valuation: { estimated: 15000 },
      analyzedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      _id: '2',
      domain: 'aiinnovation.co',
      score: 88,
      availability: { isAvailable: true },
      valuation: { estimated: 8500 },
      analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      _id: '3',
      domain: 'cloudnative.io',
      score: 82,
      availability: { isAvailable: true },
      valuation: { estimated: 12000 },
      analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    }
  ];

  const displayAnalyses = analyses.length > 0 ? analyses : mockAnalyses;

  if (displayAnalyses.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Analyses
        </h2>
        <div className={`p-8 rounded-xl text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <div className="text-4xl mb-2">📊</div>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No recent domain analyses
          </p>
          <Link
            to="/search"
            className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Analyze Your First Domain
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Analyses
        </h2>
        <Link
          to="/search"
          className={`text-sm font-medium transition-colors duration-200 ${
            isDarkMode
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-blue-600 hover:text-blue-500'
          }`}
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {displayAnalyses.slice(0, 5).map((analysis) => (
          <div
            key={analysis._id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Link
                    to={`/analysis/${analysis.domain}`}
                    className={`font-semibold hover:underline ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {analysis.domain}
                  </Link>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getScoreBadgeColor(analysis.score)
                  }`}>
                    {analysis.score}/100
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      analysis.availability?.isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {analysis.availability?.isAvailable ? 'Available' : 'Taken'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {analysis.valuation?.estimated && (
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        ${analysis.valuation.estimated.toLocaleString()}
                      </span>
                    )}
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatTimeAgo(analysis.analyzedAt)}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/analysis/${analysis.domain}`}
                      className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      View
                    </Link>
                    <button
                      className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Re-analyze
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayAnalyses.length > 5 && (
        <div className="mt-4 text-center">
          <Link
            to="/search"
            className={`inline-block px-4 py-2 rounded-lg border transition-colors duration-200 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            View All Analyses
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentAnalyses;