/**
 * Protect all non-auth routes.
 * If req.session.user is set the user is logged in — otherwise redirect to /auth/login.
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;   // available in every EJS template
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/auth/login');
};

module.exports = { requireAuth };
