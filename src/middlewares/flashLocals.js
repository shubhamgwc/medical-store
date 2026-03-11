const { STORE } = require('../config/constants');

/**
 * Injects flash messages + store info into res.locals
 * so every EJS template can access them automatically.
 */
const flashLocals = (req, res, next) => {
  res.locals.flash = {
    success: req.flash('success'),
    error:   req.flash('error'),
    info:    req.flash('info'),
    warning: req.flash('warning'),
  };
  res.locals.store        = STORE;
  res.locals.currentPath  = req.path;
  next();
};

module.exports = flashLocals;
