const dashboardService = require('../services/dashboardService');
const { handleServerError } = require('../utils/response');

class DashboardController {
  async index(req, res) {
    try {
      const data = await dashboardService.getSummary();
      res.render('dashboard/index', { ...data, page: 'dashboard' });
    } catch (err) {
      handleServerError(res, err, 'DashboardController.index');
    }
  }
}

module.exports = new DashboardController();
