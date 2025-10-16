import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6'); // Blue
  const [accentColor, setAccentColor] = useState('#8b5cf6'); // Purple

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('domain-intelligence-theme');
    const savedPrimaryColor = localStorage.getItem('domain-intelligence-primary-color');
    const savedAccentColor = localStorage.getItem('domain-intelligence-accent-color');

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }

    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
    }

    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS custom properties for dynamic colors
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--accent-color', accentColor);

    // Save to localStorage
    localStorage.setItem('domain-intelligence-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, primaryColor, accentColor]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('domain-intelligence-primary-color', color);
  };

  const updateAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('domain-intelligence-accent-color', color);
  };

  const resetToDefaults = () => {
    setPrimaryColor('#3b82f6');
    setAccentColor('#8b5cf6');
    setIsDarkMode(false);
    localStorage.removeItem('domain-intelligence-theme');
    localStorage.removeItem('domain-intelligence-primary-color');
    localStorage.removeItem('domain-intelligence-accent-color');
  };

  // Predefined color schemes
  const colorSchemes = {
    blue: { primary: '#3b82f6', accent: '#8b5cf6' },
    green: { primary: '#10b981', accent: '#059669' },
    purple: { primary: '#8b5cf6', accent: '#7c3aed' },
    indigo: { primary: '#6366f1', accent: '#4f46e5' },
    pink: { primary: '#ec4899', accent: '#be185d' },
    orange: { primary: '#f59e0b', accent: '#d97706' },
    red: { primary: '#ef4444', accent: '#dc2626' },
    emerald: { primary: '#34d399', accent: '#059669' }
  };

  const applyColorScheme = (schemeName) => {
    const scheme = colorSchemes[schemeName];
    if (scheme) {
      updatePrimaryColor(scheme.primary);
      updateAccentColor(scheme.accent);
    }
  };

  const value = {
    isDarkMode,
    primaryColor,
    accentColor,
    toggleTheme,
    updatePrimaryColor,
    updateAccentColor,
    resetToDefaults,
    colorSchemes,
    applyColorScheme,

    // Computed values for easy access
    theme: isDarkMode ? 'dark' : 'light',
    colors: {
      primary: primaryColor,
      accent: accentColor,
      background: isDarkMode ? '#1f2937' : '#ffffff',
      surface: isDarkMode ? '#374151' : '#f9fafb',
      text: isDarkMode ? '#f9fafb' : '#1f2937',
      textSecondary: isDarkMode ? '#d1d5db' : '#6b7280',
      border: isDarkMode ? '#4b5563' : '#e5e7eb'
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;