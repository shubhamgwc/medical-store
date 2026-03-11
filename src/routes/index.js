const authRoutes      = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const medicineRoutes  = require('./medicineRoutes');
const saleRoutes      = require('./saleRoutes');
const customerRoutes  = require('./customerRoutes');
const reportRoutes    = require('./reportRoutes');
const { requireAuth } = require('../middlewares/authMiddleware');

/**
 * Register all application routes onto the Express app.
 * @param {import('express').Application} app
 */
const registerRoutes = (app) => {
  // ─── Public auth routes (no login required) ──────────────────────────────
  app.use('/auth', authRoutes);

  // ─── Protected routes (must be logged in) ────────────────────────────────
  app.use('/',          requireAuth, dashboardRoutes);
  app.use('/medicines', requireAuth, medicineRoutes);
  app.use('/sales',     requireAuth, saleRoutes);
  app.use('/customers', requireAuth, customerRoutes);
  app.use('/reports',   requireAuth, reportRoutes);

  // ─── 404 catch-all ───────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).render('errors/404', { page: '' });
  });
};

module.exports = registerRoutes;
