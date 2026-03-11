const reportService = require('../services/reportService');
const { handleServerError } = require('../utils/response');

class ReportController {
  async index(req, res) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const from  = req.query.from || today;
      const to    = req.query.to   || today;
      const data  = await reportService.getReport(from, to);
      res.render('reports/index', { ...data, page: 'reports' });
    } catch (err) {
      handleServerError(res, err, 'ReportController.index');
    }
  }
}

module.exports = new ReportController();
