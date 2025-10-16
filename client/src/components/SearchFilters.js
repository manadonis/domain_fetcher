import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SearchFilters = ({
  filters,
  onFiltersChange,
  onClear,
  className = ""
}) => {
  const { isDarkMode } = useTheme();

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const tlds = [
    '.com', '.net', '.org', '.io', '.co', '.ai', '.app', '.tech',
    '.dev', '.ly', '.me', '.xyz', '.online', '.store', '.blog'
  ];

  const categories = [
    'Technology', 'Business', 'Finance', 'Health', 'Education',
    'E-commerce', 'Entertainment', 'Real Estate', 'Travel', 'Food'
  ];

  const sortOptions = [
    { value: 'score', label: 'Best Score' },
    { value: 'length', label: 'Shortest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'availability', label: 'Available First' }
  ];

  return (
    <div className={`p-6 rounded-xl ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Search Filters
        </h3>
        <button
          onClick={onClear}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* TLD Filter */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Domain Extensions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tlds.map(tld => (
              <label key={tld} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.tlds?.includes(tld) || false}
                  onChange={(e) => {
                    const currentTlds = filters.tlds || [];
                    const newTlds = e.target.checked
                      ? [...currentTlds, tld]
                      : currentTlds.filter(t => t !== tld);
                    handleFilterChange('tlds', newTlds);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {tld}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Length Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Domain Length
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min length"
                value={filters.minLength || ''}
                onChange={(e) => handleFilterChange('minLength', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max length"
                value={filters.maxLength || ''}
                onChange={(e) => handleFilterChange('maxLength', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Score Range */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Minimum Score: {filters.minScore || 0}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minScore || 0}
            onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Availability
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value=""
                checked={!filters.availability}
                onChange={(e) => handleFilterChange('availability', '')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                All domains
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value="available"
                checked={filters.availability === 'available'}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Available only
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value="taken"
                checked={filters.availability === 'taken'}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Taken only
              </span>
            </label>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Sort By
          </label>
          <select
            value={filters.sortBy || 'score'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Options */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className={`text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Advanced Options
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.excludeHyphens || false}
                onChange={(e) => handleFilterChange('excludeHyphens', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Exclude hyphens
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.excludeNumbers || false}
                onChange={(e) => handleFilterChange('excludeNumbers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Exclude numbers
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.dictionaryWords || false}
                onChange={(e) => handleFilterChange('dictionaryWords', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Dictionary words only
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;