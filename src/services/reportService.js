const invoiceRepo  = require('../repositories/invoiceRepository');
const medicineRepo = require('../repositories/medicineRepository');

class ReportService {
  async getReport(from, to) {
    const [summary, topMedicines, dailyBreakdown, lowStock, expiringSoon] = await Promise.all([
      invoiceRepo.getSummaryByDateRange(from, to),
      invoiceRepo.getTopMedicines(from, to, 10),
      invoiceRepo.getDailyBreakdown(from, to),
      medicineRepo.getLowStock(),
      medicineRepo.getExpiringSoon(60),
    ]);

    return {
      from,
      to,
      salesCount:     parseInt(summary.count),
      revenue:        parseFloat(summary.revenue).toFixed(2),
      topMedicines,
      dailyBreakdown,
      lowStock,
      expiringSoon,
    };
  }
}

module.exports = new ReportService();
