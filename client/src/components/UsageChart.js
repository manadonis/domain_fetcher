import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const UsageChart = ({ data, title, type = 'bar' }) => {
  const { isDarkMode } = useTheme();

  // Simple chart implementation without external dependencies
  const maxValue = Math.max(...data.map(item => item.value));

  const getBarHeight = (value) => {
    return (value / maxValue) * 100;
  };

  const getColor = (index) => {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16'  // Lime
    ];
    return colors[index % colors.length];
  };

  if (type === 'line') {
    // Simple line chart with SVG
    const width = 400;
    const height = 200;
    const padding = 40;

    const xStep = (width - 2 * padding) / (data.length - 1);
    const yScale = (height - 2 * padding) / maxValue;

    const points = data.map((item, index) => ({
      x: padding + index * xStep,
      y: height - padding - item.value * yScale
    }));

    const pathData = points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="w-full">
        {title && (
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
        )}
        <div className="relative">
          <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <line
                key={index}
                x1={padding}
                y1={height - padding - ratio * (height - 2 * padding)}
                x2={width - padding}
                y2={height - padding - ratio * (height - 2 * padding)}
                stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                strokeWidth="1"
              />
            ))}

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
              />
            ))}

            {/* Labels */}
            {data.map((item, index) => (
              <text
                key={index}
                x={padding + index * xStep}
                y={height - 10}
                textAnchor="middle"
                fontSize="12"
                fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
              >
                {item.label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  // Default bar chart
  return (
    <div className="w-full">
      {title && (
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-24 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className={`h-8 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className="h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${getBarHeight(item.value)}%`,
                    backgroundColor: getColor(index)
                  }}
                >
                  <span className="text-white text-sm font-medium">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageChart;