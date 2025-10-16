import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const DomainSearchBox = ({
  placeholder = "Search for domain names...",
  onSearch,
  className = "",
  showFilters = false
}) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tld: '',
    maxLength: '',
    minScore: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    if (onSearch) {
      onSearch(searchTerm.trim(), filters);
    } else {
      // Default behavior: navigate to search page
      const params = new URLSearchParams({ q: searchTerm.trim() });

      // Add filters if they exist
      if (filters.tld) params.append('tld', filters.tld);
      if (filters.maxLength) params.append('maxLength', filters.maxLength);
      if (filters.minScore) params.append('minScore', filters.minScore);

      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
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
            🔍 Search
          </button>
        </div>

        {/* Quick Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Extension
              </label>
              <select
                value={filters.tld}
                onChange={(e) => setFilters(prev => ({ ...prev, tld: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Extensions</option>
                <option value=".com">.com</option>
                <option value=".net">.net</option>
                <option value=".org">.org</option>
                <option value=".io">.io</option>
                <option value=".co">.co</option>
                <option value=".ai">.ai</option>
                <option value=".app">.app</option>
                <option value=".tech">.tech</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Max Length
              </label>
              <select
                value={filters.maxLength}
                onChange={(e) => setFilters(prev => ({ ...prev, maxLength: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Any Length</option>
                <option value="5">5 characters</option>
                <option value="6">6 characters</option>
                <option value="7">7 characters</option>
                <option value="8">8 characters</option>
                <option value="10">10 characters</option>
                <option value="15">15 characters</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Min Score
              </label>
              <select
                value={filters.minScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Any Score</option>
                <option value="50">50+</option>
                <option value="60">60+</option>
                <option value="70">70+</option>
                <option value="80">80+</option>
                <option value="90">90+</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Suggestions */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Try:
          </span>
          {[
            'tech startup',
            'ai company',
            'crypto platform',
            'health app',
            'eco friendly'
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setSearchTerm(suggestion)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

export default DomainSearchBox;