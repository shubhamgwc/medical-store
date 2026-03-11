const medicineRepo = require('../repositories/medicineRepository');
const db = require('../config/db');

class MedicineService {
  /**
   * List medicines with optional search + category filter
   */
  async listMedicines(filters = {}) {
    return medicineRepo.search(filters);
  }

  async getCategories() {
    return medicineRepo.getCategories();
  }

  async getMedicineById(id) {
    const medicine = await medicineRepo.findById(id);
    if (!medicine || !medicine.is_active) {
      const err = new Error('Medicine not found');
      err.statusCode = 404;
      throw err;
    }
    return medicine;
  }

  async getMedicinesInStock() {
    return medicineRepo.getInStock();
  }

  /**
   * Create a new medicine and record initial stock
   */
  async createMedicine(data) {
    this._validatePrices(data);
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const medicine = await medicineRepo.create(data);
      if (parseInt(data.stock_quantity) > 0) {
        await medicineRepo.adjustStock(
          client, medicine.id,
          parseInt(data.stock_quantity),
          'purchase', 'Initial stock entry'
        );
      }
      await client.query('COMMIT');
      return medicine;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update medicine details. Handles stock diff automatically.
   */
  async updateMedicine(id, data) {
    this._validatePrices(data);
    const existing = await this.getMedicineById(id);
    const client   = await db.getClient();

    try {
      await client.query('BEGIN');
      const updated = await medicineRepo.update(id, data);
      const diff = parseInt(data.stock_quantity) - existing.stock_quantity;
      if (diff !== 0) {
        await medicineRepo.adjustStock(
          client, id, diff, 'manual',
          'Stock updated via edit form'
        );
      }
      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Restock: add quantity to existing medicine
   */
  async restockMedicine(id, quantity, reason) {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      const err = new Error('Quantity must be a positive number');
      err.statusCode = 422;
      throw err;
    }
    await this.getMedicineById(id); // ensure exists
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const result = await medicineRepo.adjustStock(client, id, qty, 'purchase', reason || 'Restock');
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteMedicine(id) {
    await this.getMedicineById(id);
    return medicineRepo.softDelete(id);
  }

  async getDashboardAlerts() {
    const [lowStock, expiringSoon] = await Promise.all([
      medicineRepo.getLowStock(),
      medicineRepo.getExpiringSoon(30),
    ]);
    return { lowStock, expiringSoon };
  }

  _validatePrices(data) {
    if (parseFloat(data.selling_price) < parseFloat(data.purchase_price)) {
      const err = new Error('Selling price cannot be less than purchase price');
      err.statusCode = 422;
      throw err;
    }
  }
}

module.exports = new MedicineService();
