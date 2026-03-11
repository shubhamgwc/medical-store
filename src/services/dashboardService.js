const invoiceRepo  = require('../repositories/invoiceRepository');
const medicineRepo = require('../repositories/medicineRepository');

class DashboardService {
  async getSummary() {
    const [
      todaySummary,
      totalMedicines,
      lowStockCount,
      recentSales,
      expiringSoon,
      lowStock,
    ] = await Promise.all([
      invoiceRepo.getTodaySummary(),
      medicineRepo.count('is_active = TRUE'),
      medicineRepo.count('stock_quantity <= min_stock_alert AND is_active = TRUE'),
      invoiceRepo.getRecentSales(5),
      medicineRepo.getExpiringSoon(30),
      medicineRepo.getLowStock(),
    ]);

    return {
      todaySalesCount: parseInt(todaySummary.count),
      todayRevenue:    parseFloat(todaySummary.revenue).toFixed(2),
      totalMedicines,
      lowStockCount,
      recentSales,
      expiringSoon,
      lowStock,
    };
  }
}

module.exports = new DashboardService();
