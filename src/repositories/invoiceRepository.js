const BaseRepository = require('./baseRepository');
const db = require('../config/db');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super('invoices');
  }

  async search({ search, from, to } = {}) {
    const params = [];
    const conds  = [];

    if (from) { params.push(from); conds.push(`DATE(created_at) >= $${params.length}`); }
    if (to)   { params.push(to);   conds.push(`DATE(created_at) <= $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      conds.push(`(invoice_number ILIKE $${params.length} OR customer_name ILIKE $${params.length})`);
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const result = await db.query(
      `SELECT * FROM invoices ${where} ORDER BY created_at DESC LIMIT 200`,
      params
    );
    return result.rows;
  }

  async findByIdWithItems(id) {
    const inv = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (!inv.rows.length) return null;

    const items = await db.query(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id`,
      [id]
    );
    return { ...inv.rows[0], items: items.rows };
  }

  async getRecentSales(limit = 5) {
    const result = await db.query(
      `SELECT * FROM invoices ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getTodaySummary() {
    const result = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue
       FROM invoices
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    return result.rows[0];
  }

  async getSummaryByDateRange(from, to) {
    const result = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue
       FROM invoices
       WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [from, to]
    );
    return result.rows[0];
  }

  async getDailyBreakdown(from, to) {
    const result = await db.query(
      `SELECT DATE(created_at) AS date,
              COUNT(*)          AS count,
              SUM(total_amount) AS revenue
       FROM invoices
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [from, to]
    );
    return result.rows;
  }

  async getTopMedicines(from, to, limit = 10) {
    const result = await db.query(
      `SELECT ii.medicine_name,
              SUM(ii.quantity)   AS qty_sold,
              SUM(ii.subtotal)   AS revenue
       FROM invoice_items ii
       JOIN invoices i ON ii.invoice_id = i.id
       WHERE DATE(i.created_at) BETWEEN $1 AND $2
       GROUP BY ii.medicine_name
       ORDER BY qty_sold DESC
       LIMIT $3`,
      [from, to, limit]
    );
    return result.rows;
  }

  async createWithItems(client, invoiceData, items) {
    const {
      invoice_number, customer_id, customer_name, customer_phone,
      subtotal, discount_percent, discount_amount,
      tax_percent, tax_amount, total_amount,
      payment_method, notes,
    } = invoiceData;

    const inv = await client.query(
      `INSERT INTO invoices
         (invoice_number, customer_id, customer_name, customer_phone,
          subtotal, discount_percent, discount_amount,
          tax_percent, tax_amount, total_amount, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [invoice_number, customer_id || null, customer_name, customer_phone,
       subtotal, discount_percent, discount_amount,
       tax_percent, tax_amount, total_amount, payment_method, notes]
    );
    const invoice = inv.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items (invoice_id, medicine_id, medicine_name, quantity, unit_price, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [invoice.id, item.medicine_id, item.medicine_name, item.quantity, item.unit_price, item.subtotal]
      );
    }
    return invoice;
  }

  async getItemsByInvoiceId(invoiceId) {
    const result = await db.query(
      `SELECT * FROM invoice_items WHERE invoice_id = $1`,
      [invoiceId]
    );
    return result.rows;
  }
}

module.exports = new InvoiceRepository();
