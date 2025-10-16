import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

const BrandableGenerator = ({ onGenerate, className = '' }) => {
  const { isDarkMode } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    industry: '',
    length: 'short',
    style: 'modern',
    includeNumbers: false,
    includeTLD: '.com'
  });

  const industries = [
    'Technology',
    'Finance',
    'Health',
    'Education',
    'E-commerce',
    'Entertainment',
    'Real Estate',
    'Food & Beverage',
    'Travel',
    'Sports'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Mock generation process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockDomains = [
      { name: 'Nexatech.com', score: 95, reason: 'Short, modern, tech-focused' },
      { name: 'Veloxa.com', score: 88, reason: 'Brandable, easy to pronounce' },
      { name: 'Zyntec.com', score: 82, reason: 'Unique, memorable combination' },
      { name: 'Qorixa.com', score: 79, reason: 'Creative, distinctive sound' },
      { name: 'Fynara.com', score: 76, reason: 'Elegant, professional feel' }
    ];

    setIsGenerating(false);

    if (onGenerate) {
      onGenerate(mockDomains);
    }
  };

  return (
    <div className={`p-6 rounded-xl ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg ${className}`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        🎨 Brandable Domain Generator
      </h3>

      <div className="space-y-4">
        {/* Industry Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Industry/Category
          </label>
          <select
            value={options.industry}
            onChange={(e) => setOptions(prev => ({ ...prev, industry: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Select industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Length Preference */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Preferred Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'short', label: 'Short (4-6)' },
              { value: 'medium', label: 'Medium (6-8)' },
              { value: 'long', label: 'Long (8-12)' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="length"
                  value={option.value}
                  checked={options.length === option.value}
                  onChange={(e) => setOptions(prev => ({ ...prev, length: e.target.value }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'modern', label: 'Modern & Tech' },
              { value: 'classic', label: 'Classic & Pro' },
              { value: 'creative', label: 'Creative & Fun' },
              { value: 'minimal', label: 'Minimal & Clean' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="style"
                  value={option.value}
                  checked={options.style === option.value}
                  onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* TLD Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Domain Extension
          </label>
          <select
            value={options.includeTLD}
            onChange={(e) => setOptions(prev => ({ ...prev, includeTLD: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value=".com">.com</option>
            <option value=".io">.io</option>
            <option value=".co">.co</option>
            <option value=".ai">.ai</option>
            <option value=".app">.app</option>
            <option value=".tech">.tech</option>
          </select>
        </div>

        {/* Additional Options */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Include numbers
            </span>
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </div>
          ) : (
            '✨ Generate Brandable Domains'
          )}
        </button>

        {/* Tips */}
        <div className={`p-3 rounded-lg text-xs ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-800'
        }`}>
          <div className="flex items-start space-x-2">
            <span>💡</span>
            <div>
              <strong>Pro Tips:</strong> Brandable domains are invented names that are short,
              memorable, and easy to pronounce. They often combine syllables or modify
              existing words to create something unique and ownable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandableGenerator;