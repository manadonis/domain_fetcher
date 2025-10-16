import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const DomainResults = ({ results, query, totalGenerated, searchTime }) => {
  const [sortBy, setSortBy] = useState('score');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [favorites, setFavorites] = useState(new Set());

  // Sort results
  const sortedResults = [...(results || [])].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'value':
        return (b.estimatedValue?.min || 0) - (a.estimatedValue?.min || 0);
      case 'domain':
        return a.domain.localeCompare(b.domain);
      case 'length':
        return a.domain.split('.')[0].length - b.domain.split('.')[0].length;
      default:
        return 0;
    }
  });

  const toggleFavorite = (domain) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(domain)) {
      newFavorites.delete(domain);
    } else {
      newFavorites.add(domain);
    }
    setFavorites(newFavorites);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {results.length} domains found
            {totalGenerated && ` from ${totalGenerated} generated`}
            {searchTime && ` in ${searchTime}ms`}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="score">Sort by Score</option>
            <option value="value">Sort by Value</option>
            <option value="domain">Sort by Name</option>
            <option value="length">Sort by Length</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {sortedResults.map((result, index) => (
          <DomainCard
            key={result.domain}
            result={result}
            index={index}
            viewMode={viewMode}
            isFavorite={favorites.has(result.domain)}
            onToggleFavorite={() => toggleFavorite(result.domain)}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Domain Card Component
const DomainCard = ({ result, index, viewMode, isFavorite, onToggleFavorite }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 w-8">
              #{index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                  {result.domain}
                </h3>
                {result.available ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" title="Available" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" title="Taken" />
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2 text-sm">
                {result.industries && result.industries.length > 0 && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {result.industries.slice(0, 2).join(', ')}
                  </span>
                )}
                {result.keywords && result.keywords.length > 0 && (
                  <span className="text-gray-500 dark:text-gray-500">
                    Keywords: {result.keywords.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Score */}
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(result.score)}`}>
              <span className={getScoreColor(result.score)}>
                {result.score}/10
              </span>
            </div>

            {/* Value */}
            {result.estimatedValue && (
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${result.estimatedValue.min?.toLocaleString()} - ${result.estimatedValue.max?.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Estimated Value</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleFavorite}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isFavorite ? (
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>

              <Link
                to={`/analysis?domain=${result.domain}`}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Analyze
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-mono font-semibold text-gray-900 dark:text-white truncate">
                {result.domain}
              </h3>
              {result.available ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" title="Available" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" title="Taken" />
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {result.available ? 'Available for registration' : 'Currently registered'}
            </div>
          </div>

          <button
            onClick={onToggleFavorite}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Score & Value */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(result.score)}`}>
            <span className={getScoreColor(result.score)}>
              {result.score}/10
            </span>
          </div>

          {result.estimatedValue && (
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${result.estimatedValue.min?.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-500">Est. Value</div>
            </div>
          )}
        </div>

        {/* Industries/Keywords */}
        {(result.industries?.length > 0 || result.keywords?.length > 0) && (
          <div className="space-y-2 mb-4">
            {result.industries && result.industries.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.industries.slice(0, 2).map((industry) => (
                  <span
                    key={industry}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            )}

            {result.keywords && result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          <Link
            to={`/analysis?domain=${result.domain}`}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Full Analysis
          </Link>
        </div>

        {/* Expandable Details */}
        {showDetails && result.analysis && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Brevity</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {result.analysis.scoring?.brevity}/10
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Commercial</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {result.analysis.scoring?.commercial}/10
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">SEO</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {result.analysis.scoring?.seo}/10
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Trends</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {result.analysis.scoring?.trend}/10
                </div>
              </div>
            </div>

            {result.analysis.availability?.lastChecked && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last checked: {new Date(result.analysis.availability.lastChecked).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainResults;