const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Payment/Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    const message = 'Payment processing error';
    error = { message, statusCode: 402 };
  }

  // Domain analysis specific errors
  if (err.message && err.message.includes('Domain analysis failed')) {
    error = {
      message: 'Unable to analyze domain at this time',
      statusCode: 503,
      retryAfter: 30
    };
  }

  // External API errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    error = {
      message: 'External service unavailable',
      statusCode: 503,
      retryAfter: 60
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 413,
      maxSize: '10MB'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 413,
      maxFiles: 10
    };
  }

  // Database connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    error = {
      message: 'Database connection error',
      statusCode: 503,
      retryAfter: 30
    };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = error;
  }

  // Add retry information for temporary errors
  if (error.retryAfter) {
    errorResponse.retryAfter = error.retryAfter;
    res.set('Retry-After', error.retryAfter);
  }

  // Add specific error context based on error type
  switch (statusCode) {
    case 400:
      errorResponse.type = 'ValidationError';
      errorResponse.help = 'Please check your request parameters and try again.';
      break;
    case 401:
      errorResponse.type = 'AuthenticationError';
      errorResponse.help = 'Please log in or check your authentication credentials.';
      break;
    case 403:
      errorResponse.type = 'AuthorizationError';
      errorResponse.help = 'You do not have permission to perform this action.';
      break;
    case 404:
      errorResponse.type = 'NotFoundError';
      errorResponse.help = 'The requested resource was not found.';
      break;
    case 413:
      errorResponse.type = 'PayloadTooLargeError';
      errorResponse.help = 'Please reduce the size of your request.';
      break;
    case 429:
      errorResponse.type = 'RateLimitError';
      errorResponse.help = 'Please wait before making another request.';
      break;
    case 503:
      errorResponse.type = 'ServiceUnavailableError';
      errorResponse.help = 'The service is temporarily unavailable. Please try again later.';
      break;
    default:
      errorResponse.type = 'InternalServerError';
      errorResponse.help = 'An unexpected error occurred. Please contact support if this persists.';
  }

  // Log critical errors for monitoring
  if (statusCode >= 500) {
    console.error('CRITICAL ERROR:', {
      message: error.message,
      stack: err.stack,
      userId: req.user?.id,
      endpoint: `${req.method} ${req.path}`,
      timestamp: new Date().toISOString()
    });

    // Here you would typically send to error monitoring service
    // like Sentry, Bugsnag, or custom logging service
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;