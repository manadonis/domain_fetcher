import React, { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import SearchFilters from '../components/SearchFilters';
import DomainResults from '../components/DomainResults';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BrandableGenerator from '../components/BrandableGenerator';

const DomainSearch = () => {
  const { user, canPerformAction } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industries: ['general'],
    tlds: ['.com', '.io', '.ai'],
    maxResults: 25,
    includeAnalysis: true,
    onlyAvailable: true,
    minScore: 5,
    minLength: 3,
    maxLength: 15,
    includeNumbers: false,
    includeHyphens: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBrandable, setShowBrandable] = useState(false);
  const [searchMode, setSearchMode] = useState('search'); // search, advanced, brandable
  const [hasSearched, setHasSearched] = useState(false);

  // Search domains
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: performSearch,
  } = useQuery(
    ['domainSearch', searchQuery, filters],
    async () => {
      if (!searchQuery.trim()) return null;

      const params = new URLSearchParams({
        q: searchQuery,
        industries: filters.industries.join(','),
        tlds: filters.tlds.join(','),
        maxResults: filters.maxResults,
        includeAnalysis: filters.includeAnalysis,
        onlyAvailable: filters.onlyAvailable,
        minScore: filters.minScore,
      });

      const response = await api.get(`/domains/search?${params}`);
      return response.data;
    },
    {
      enabled: false, // Manual trigger
      retry: 1,
    }
  );

  // Advanced search
  const {
    data: advancedResults,
    isLoading: isAdvancedSearching,
    error: advancedError,
    refetch: performAdvancedSearch,
  } = useQuery(
    ['advancedSearch', filters],
    async () => {
      const response = await api.post('/domains/advanced-search', {
        keywords: searchQuery ? [searchQuery] : [],
        ...filters,
      });
      return response.data;
    },
    {
      enabled: false,
      retry: 1,
    }
  );

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    if (!canPerformAction('search')) {
      alert('Search limit exceeded. Please upgrade your plan.');
      return;
    }

    setHasSearched(true);

    if (searchMode === 'advanced') {
      performAdvancedSearch();
    } else {
      performSearch();
    }
  }, [searchQuery, searchMode, canPerformAction, performSearch, performAdvancedSearch]);

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Export results
  const handleExport = async () => {
    if (!canPerformAction('export')) {
      alert('Export limit exceeded. Please upgrade your plan.');
      return;
    }

    try {
      const results = searchResults || advancedResults;
      if (!results?.results?.length) return;

      // Create CSV content
      const csvData = results.results.map(result => ({
        domain: result.domain,
        score: result.score,
        available: result.available ? 'Yes' : 'No',
        estimatedValue: result.estimatedValue ? `$${result.estimatedValue.min} - $${result.estimatedValue.max}` : 'N/A',
        industries: result.industries?.join(', ') || '',
        keywords: result.keywords?.join(', ') || '',
      }));

      // Create and download file
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `domain-search-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const currentResults = searchMode === 'advanced' ? advancedResults : searchResults;
  const isLoading = searchMode === 'advanced' ? isAdvancedSearching : isSearching;
  const searchError_current = searchMode === 'advanced' ? advancedError : searchError;

  return (
    <>
      <Helmet>
        <title>Domain Search - Domain Intelligence Platform</title>
        <meta name="description" content="Search and discover high-value domains with AI-powered analysis" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Perfect Domain
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Search millions of domains with AI-powered analysis. Get instant valuations,
              SEO insights, and market intelligence.
            </p>
          </div>

          {/* Search Mode Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-soft">
              <div className="flex space-x-1">
                <button
                  onClick={() => setSearchMode('search')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchMode === 'search'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Quick Search
                </button>
                <button
                  onClick={() => setSearchMode('advanced')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchMode === 'advanced'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Advanced Search
                </button>
                <button
                  onClick={() => setSearchMode('brandable')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchMode === 'brandable'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Brandable Names
                </button>
              </div>
            </div>
          </div>

          {/* Search Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-8">
            {searchMode === 'brandable' ? (
              <BrandableGenerator />
            ) : (
              <>
                {/* Main Search Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter keywords, domain ideas, or industry terms..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                        showFilters
                          ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FunnelIcon className="h-4 w-4 mr-2" />
                      Filters
                    </button>

                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isLoading}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <SearchFilters
                    filters={filters}
                    onChange={setFilters}
                    isAdvanced={searchMode === 'advanced'}
                  />
                )}

                {/* Search Stats */}
                {hasSearched && currentResults && (
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      Found {currentResults.results?.length || 0} domains
                      {currentResults.totalGenerated && (
                        <span className="ml-2">
                          (from {currentResults.totalGenerated} generated)
                        </span>
                      )}
                    </div>
                    {currentResults.results?.length > 0 && (
                      <button
                        onClick={handleExport}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Export CSV
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results */}
          <div>
            {isLoading && (
              <div className="text-center py-12">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Analyzing domains and generating suggestions...
                </p>
              </div>
            )}

            {searchError_current && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-400">
                  Search failed: {searchError_current.message}
                </p>
              </div>
            )}

            {!isLoading && !searchError_current && currentResults && (
              <DomainResults
                results={currentResults.results}
                query={searchQuery}
                totalGenerated={currentResults.totalGenerated}
                searchTime={currentResults.searchTime}
              />
            )}

            {!isLoading && !searchError_current && hasSearched && !currentResults?.results?.length && (
              <EmptyState
                icon={MagnifyingGlassIcon}
                title="No domains found"
                description="Try adjusting your search terms or filters to find more results."
                action={{
                  label: 'Clear filters',
                  onClick: () => setFilters({
                    industries: ['general'],
                    tlds: ['.com', '.io', '.ai'],
                    maxResults: 25,
                    includeAnalysis: true,
                    onlyAvailable: true,
                    minScore: 5,
                    minLength: 3,
                    maxLength: 15,
                    includeNumbers: false,
                    includeHyphens: false,
                  })
                }}
              />
            )}

            {!hasSearched && (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to find your perfect domain?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Enter your search terms above and let our AI-powered engine find the best domains for you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DomainSearch;