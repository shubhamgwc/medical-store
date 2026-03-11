/**
 * Global error handling middleware.
 * Catches anything passed to next(err).
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'An unexpected error occurred';

  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url} — ${message}`);

  if (statusCode === 404) {
    return res.status(404).render('errors/404', { page: '' });
  }

  res.status(statusCode).render('errors/500', { message, page: '' });
};

module.exports = errorHandler;
