import React from 'react';

const LoadingSpinner = ({
  size = 'medium',
  text = '',
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  const spinnerClass = `${sizeClasses[size]} border-2 border-gray-300 ${colorClasses[color]} border-t-transparent rounded-full animate-spin ${className}`;

  if (size === 'large' || size === 'xlarge') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={spinnerClass} />
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={spinnerClass} />
      {text && (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;