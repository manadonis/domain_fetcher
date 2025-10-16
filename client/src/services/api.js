import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle rate limiting
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          error.retryAfter = parseInt(retryAfter) * 1000; // Convert to milliseconds
        }
      }

      // Enhance error with user-friendly message
      error.userMessage = data?.message || getErrorMessage(status);
    } else if (error.request) {
      // Network error
      error.userMessage = 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }

    return Promise.reject(error);
  }
);

// Helper function to get user-friendly error messages
const getErrorMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict. The resource already exists or cannot be modified.';
    case 413:
      return 'Request too large. Please reduce the size of your data.';
    case 429:
      return 'Too many requests. Please wait before trying again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Request timeout. Please try again.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePreferences: (preferences) => api.put('/auth/preferences', { preferences }),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const domainAPI = {
  analyze: (domain) => api.post('/domains/analyze', { domain }),
  bulkAnalyze: (domains, options) => api.post('/domains/bulk-analyze', { domains, options }),
  search: (params) => api.get('/domains/search', { params }),
  advancedSearch: (filters) => api.post('/domains/advanced-search', filters),
  generateBrandable: (concept, options) => api.post('/domains/generate-brandable', { concept, ...options }),
  getDomain: (domain) => api.get(`/domains/${domain}`),
  addToWatchlist: (domain) => api.post(`/domains/${domain}/watchlist`),
  removeFromWatchlist: (domain) => api.delete(`/domains/${domain}/watchlist`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsageStats: () => api.get('/analytics/usage'),
  getPortfolioAnalytics: () => api.get('/analytics/portfolio'),
  getMarketTrends: () => api.get('/analytics/market-trends'),
  exportData: (type, filters) => api.post('/analytics/export', { type, filters }),
};

export const portfolioAPI = {
  getPortfolio: (params) => api.get('/portfolio', { params }),
  addDomain: (domain) => api.post('/portfolio', domain),
  updateDomain: (id, data) => api.put(`/portfolio/${id}`, data),
  removeDomain: (id) => api.delete(`/portfolio/${id}`),
  getWatchlist: () => api.get('/portfolio/watchlist'),
  getCollections: () => api.get('/portfolio/collections'),
  createCollection: (data) => api.post('/portfolio/collections', data),
};

export const marketplaceAPI = {
  getListings: (params) => api.get('/marketplace', { params }),
  getListing: (id) => api.get(`/marketplace/${id}`),
  createListing: (data) => api.post('/marketplace', data),
  updateListing: (id, data) => api.put(`/marketplace/${id}`, data),
  deleteListing: (id) => api.delete(`/marketplace/${id}`),
  placeBid: (id, amount) => api.post(`/marketplace/${id}/bid`, { amount }),
  getAuctions: (params) => api.get('/marketplace/auctions', { params }),
  getSales: (params) => api.get('/marketplace/sales', { params }),
};

export const subscriptionAPI = {
  getPlans: () => api.get('/subscription/plans'),
  getCurrentSubscription: () => api.get('/subscription/current'),
  subscribe: (planId, paymentMethod) => api.post('/subscription/subscribe', { planId, paymentMethod }),
  updateSubscription: (planId) => api.put('/subscription/update', { planId }),
  cancelSubscription: () => api.post('/subscription/cancel'),
  getInvoices: () => api.get('/subscription/invoices'),
  updatePaymentMethod: (paymentMethod) => api.put('/subscription/payment-method', { paymentMethod }),
};

export const reportsAPI = {
  generateReport: (type, params) => api.post('/reports/generate', { type, params }),
  getReport: (id) => api.get(`/reports/${id}`),
  getReports: (params) => api.get('/reports', { params }),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

// Utility functions
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });
};

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Request retry helper
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (i === maxRetries) {
        break;
      }

      // Calculate delay (exponential backoff)
      const backoffDelay = delay * Math.pow(2, i);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      const totalDelay = backoffDelay + jitter;

      // Use retry-after header if available
      if (error.retryAfter) {
        await new Promise(resolve => setTimeout(resolve, error.retryAfter));
      } else {
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }

  throw lastError;
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;