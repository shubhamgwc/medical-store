const invoiceRepo   = require('../repositories/invoiceRepository');
const medicineRepo  = require('../repositories/medicineRepository');
const db            = require('../config/db');
const { generateInvoiceNumber, calcTotals } = require('../utils/helpers');

class SaleService {
  /**
   * Create a complete sale (invoice + items + stock deduction) in one transaction.
   */
  async createSale(saleData) {
    const {
      customer_name, customer_phone, customer_id,
      discount_percent, tax_percent, payment_method, notes,
      items,
    } = saleData;

    if (!items || !items.length) {
      const err = new Error('Cannot create a sale with no items');
      err.statusCode = 422;
      throw err;
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.medicine_id || !item.quantity || !item.unit_price) {
        const err = new Error('Each item must have medicine_id, quantity, and unit_price');
        err.statusCode = 422;
        throw err;
      }
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Calculate subtotal from items
      const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
      const totals   = calcTotals(subtotal, discount_percent, tax_percent);

      const invoiceData = {
        invoice_number:   generateInvoiceNumber(),
        customer_id:      customer_id   || null,
        customer_name:    customer_name || 'Walk-in Customer',
        customer_phone:   customer_phone || null,
        subtotal:         totals.subtotal,
        discount_percent: parseFloat(discount_percent) || 0,
        discount_amount:  totals.discountAmount,
        tax_percent:      parseFloat(tax_percent) || 0,
        tax_amount:       totals.taxAmount,
        total_amount:     totals.total,
        payment_method:   payment_method || 'cash',
        notes:            notes || null,
      };

      // Prepare items with their subtotals
      const normalizedItems = items.map(i => ({
        medicine_id:   i.medicine_id,
        medicine_name: i.medicine_name,
        quantity:      parseInt(i.quantity),
        unit_price:    parseFloat(i.unit_price),
        subtotal:      +(parseInt(i.quantity) * parseFloat(i.unit_price)).toFixed(2),
      }));

      // Create invoice + items in DB
      const invoice = await invoiceRepo.createWithItems(client, invoiceData, normalizedItems);

      // Deduct stock for each item
      for (const item of normalizedItems) {
        await medicineRepo.adjustStock(
          client,
          item.medicine_id,
          -item.quantity,
          'sale',
          `Invoice ${invoice.invoice_number}`,
          invoice.id
        );
      }

      await client.query('COMMIT');
      return invoice;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete an invoice and restore stock.
   */
  async deleteSale(id) {
    const invoice = await invoiceRepo.findByIdWithItems(id);
    if (!invoice) {
      const err = new Error('Invoice not found');
      err.statusCode = 404;
      throw err;
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Restore stock for each item
      for (const item of invoice.items) {
        if (item.medicine_id) {
          await medicineRepo.adjustStock(
            client, item.medicine_id,
            item.quantity, 'return',
            `Return from deleted invoice ${invoice.invoice_number}`,
            invoice.id
          );
        }
      }

      await client.query(`DELETE FROM invoices WHERE id = $1`, [id]);
      await client.query('COMMIT');
      return invoice;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getInvoiceWithItems(id) {
    const invoice = await invoiceRepo.findByIdWithItems(id);
    if (!invoice) {
      const err = new Error('Invoice not found');
      err.statusCode = 404;
      throw err;
    }
    return invoice;
  }

  async listInvoices(filters = {}) {
    return invoiceRepo.search(filters);
  }
}

module.exports = new SaleService();
