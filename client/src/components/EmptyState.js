import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const EmptyState = ({
  icon = '📄',
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  actionText = 'Get Started',
  actionLink = '/',
  showAction = true,
  className = ''
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className={`text-xl font-semibold mb-2 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`mb-6 max-w-md mx-auto ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {description}
      </p>
      {showAction && (
        <Link
          to={actionLink}
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;