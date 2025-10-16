import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const NotFound = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className={`text-9xl font-bold ${
            isDarkMode ? 'text-gray-700' : 'text-gray-300'
          }`}>
            404
          </h1>
        </div>

        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Page Not Found
          </h2>
          <p className={`text-lg mb-6 max-w-md mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Oops! The page you're looking for doesn't exist.
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go Home
          </Link>
          <Link
            to="/search"
            className={`inline-block px-6 py-3 font-semibold rounded-lg border-2 transition-colors duration-200 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Search Domains
          </Link>
        </div>

        <div className="mt-12">
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-700 underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;