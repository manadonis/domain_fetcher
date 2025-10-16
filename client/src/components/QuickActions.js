import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const QuickActions = ({ className = "" }) => {
  const { isDarkMode } = useTheme();

  const actions = [
    {
      title: 'Domain Search',
      description: 'Find available domains',
      icon: '🔍',
      link: '/search',
      color: 'blue'
    },
    {
      title: 'Bulk Analysis',
      description: 'Analyze multiple domains',
      icon: '📊',
      link: '/bulk-analysis',
      color: 'green'
    },
    {
      title: 'Portfolio',
      description: 'Manage your domains',
      icon: '📁',
      link: '/portfolio',
      color: 'purple'
    },
    {
      title: 'Marketplace',
      description: 'Browse premium domains',
      icon: '🏪',
      link: '/marketplace',
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: isDarkMode ? 'bg-blue-900' : 'bg-blue-50',
        border: 'border-blue-200 dark:border-blue-700',
        icon: 'text-blue-600',
        text: isDarkMode ? 'text-blue-200' : 'text-blue-800',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-800'
      },
      green: {
        bg: isDarkMode ? 'bg-green-900' : 'bg-green-50',
        border: 'border-green-200 dark:border-green-700',
        icon: 'text-green-600',
        text: isDarkMode ? 'text-green-200' : 'text-green-800',
        hover: 'hover:bg-green-100 dark:hover:bg-green-800'
      },
      purple: {
        bg: isDarkMode ? 'bg-purple-900' : 'bg-purple-50',
        border: 'border-purple-200 dark:border-purple-700',
        icon: 'text-purple-600',
        text: isDarkMode ? 'text-purple-200' : 'text-purple-800',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-800'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900' : 'bg-orange-50',
        border: 'border-orange-200 dark:border-orange-700',
        icon: 'text-orange-600',
        text: isDarkMode ? 'text-orange-200' : 'text-orange-800',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-800'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={`w-full ${className}`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const colors = getColorClasses(action.color);

          return (
            <Link
              key={index}
              to={action.link}
              className={`p-4 rounded-xl border transition-all duration-200 transform hover:scale-105 ${colors.bg} ${colors.border} ${colors.hover}`}
            >
              <div className="text-center">
                <div className={`text-3xl mb-2 ${colors.icon}`}>
                  {action.icon}
                </div>
                <h3 className={`font-semibold mb-1 ${colors.text}`}>
                  {action.title}
                </h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;