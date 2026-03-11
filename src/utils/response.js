const flashSuccess = (req, res, message, redirectTo) => {
  req.flash('success', message);
  res.redirect(redirectTo);
};

const flashError = (req, res, message, redirectTo) => {
  req.flash('error', message);
  res.redirect(redirectTo);
};

const renderView = (res, view, data = {}) => {
  res.render(view, { ...data });
};

const jsonSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

const jsonError = (res, message = 'Something went wrong', statusCode = 400, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  res.status(statusCode).json(payload);
};

/**
 * Handles unexpected controller errors.
 * Ensures page/flash/store locals are always set before rendering error view.
 */
const handleServerError = (res, err, context = '') => {
  console.error(`[ERROR]${context ? ' ' + context : ''}:`, err.message || err);
  res.locals.page  = res.locals.page  || '';
  res.locals.flash = res.locals.flash || { success: [], error: [], info: [], warning: [] };
  res.locals.store = res.locals.store || { name: 'MediStore Pro' };
  res.status(500).render('errors/500', { message: err.message });
};

module.exports = {
  flashSuccess,
  flashError,
  renderView,
  jsonSuccess,
  jsonError,
  handleServerError,
};