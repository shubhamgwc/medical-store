/**
 * Global error handling middleware.
 * Always passes page:'', flash, store so the error views render correctly.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'An unexpected error occurred';

  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url} — ${message}`);

  // Ensure res.locals always has the vars the header partial needs
  res.locals.page  = res.locals.page  || '';
  res.locals.flash = res.locals.flash || { success: [], error: [], info: [], warning: [] };
  res.locals.store = res.locals.store || { name: 'MediStore Pro' };

  if (statusCode === 404) {
    return res.status(404).render('errors/404');
  }

  res.status(statusCode).render('errors/500', { message });
};

module.exports = errorHandler;