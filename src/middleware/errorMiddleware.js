/**
 * Centralized Error and 404 Handlers
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(`💥 [Error] ${err.name || 'Error'}: ${err.message}`);
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
