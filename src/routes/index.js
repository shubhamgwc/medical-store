const dashboardRoutes = require('./dashboardRoutes');
const medicineRoutes  = require('./medicineRoutes');
const saleRoutes      = require('./saleRoutes');
const customerRoutes  = require('./customerRoutes');
const reportRoutes    = require('./reportRoutes');

/**
 * Register all application routes onto the Express app.
 * @param {import('express').Application} app
 */
const registerRoutes = (app) => {
  app.use('/',          dashboardRoutes);
  app.use('/medicines', medicineRoutes);
  app.use('/sales',     saleRoutes);
  app.use('/customers', customerRoutes);
  app.use('/reports',   reportRoutes);

  // 404 catch-all
  app.use((req, res) => {
    res.status(404).render('errors/404', { page: '' });
  });
};

module.exports = registerRoutes;
