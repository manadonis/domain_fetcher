import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

// Auth Context
const AuthContext = createContext();

// Action Types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
};

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Get user data
          const response = await api.get('/auth/me');

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      }

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';

      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];

    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      const { user } = response.data;

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: user,
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Update preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', { preferences });

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: {
          ...state.user,
          preferences: response.data.preferences,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Preferences update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Check if user has permission for action
  const canPerformAction = (actionType) => {
    if (!state.user) return false;

    const limits = {
      free: { searches: 50, analyses: 10, exports: 2 },
      basic: { searches: 500, analyses: 100, exports: 20 },
      professional: { searches: 5000, analyses: 1000, exports: 100 },
      enterprise: { searches: -1, analyses: -1, exports: -1 }, // unlimited
    };

    const userLimits = limits[state.user.plan] || limits.free;
    const userUsage = state.user.usage;

    // Check if it's a new month
    const now = new Date();
    const lastReset = new Date(userUsage.lastResetDate);

    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // Would need to reset usage on server, for now assume it's handled
    }

    // Check limits
    switch (actionType) {
      case 'search':
        return userLimits.searches === -1 || userUsage.monthlySearches < userLimits.searches;
      case 'analysis':
        return userLimits.analyses === -1 || userUsage.monthlyAnalyses < userLimits.analyses;
      case 'export':
        return userLimits.exports === -1 || userUsage.monthlyExports < userLimits.exports;
      default:
        return false;
    }
  };

  // Get usage stats
  const getUsageStats = () => {
    if (!state.user) return null;

    const limits = {
      free: { searches: 50, analyses: 10, exports: 2 },
      basic: { searches: 500, analyses: 100, exports: 20 },
      professional: { searches: 5000, analyses: 1000, exports: 100 },
      enterprise: { searches: -1, analyses: -1, exports: -1 }, // unlimited
    };

    const userLimits = limits[state.user.plan] || limits.free;
    const userUsage = state.user.usage;

    return {
      searches: {
        used: userUsage.monthlySearches,
        limit: userLimits.searches,
        percentage: userLimits.searches === -1 ? 0 : (userUsage.monthlySearches / userLimits.searches) * 100,
      },
      analyses: {
        used: userUsage.monthlyAnalyses,
        limit: userLimits.analyses,
        percentage: userLimits.analyses === -1 ? 0 : (userUsage.monthlyAnalyses / userLimits.analyses) * 100,
      },
      exports: {
        used: userUsage.monthlyExports,
        limit: userLimits.exports,
        percentage: userLimits.exports === -1 ? 0 : (userUsage.monthlyExports / userLimits.exports) * 100,
      },
    };
  };

  // Context value
  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    updatePreferences,
    changePassword,
    canPerformAction,
    getUsageStats,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};