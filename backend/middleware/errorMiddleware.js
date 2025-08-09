export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 400;
    message = 'Resource already exists';
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Sanitize error messages for production
  const sanitizeMessage = (msg) => {
    if (process.env.NODE_ENV === 'production') {
      // Remove potential sensitive information
      return msg
        .replace(/password|token|secret|key|database|sql/gi, '[REDACTED]')
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]'); // Remove IP addresses
    }
    return msg;
  };

  const response = {
    success: false,
    message: sanitizeMessage(message),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalMessage: err.message 
    })
  };

  // Log errors securely
  console.error(`Error ${statusCode}: ${sanitizeMessage(message)}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json(response);
};