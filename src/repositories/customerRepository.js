const BaseRepository = require('./baseRepository');
const db = require('../config/db');

class CustomerRepository extends BaseRepository {
  constructor() {
    super('customers');
  }

  async search({ search } = {}) {
    const params = ['%' + (search || '') + '%'];
    const result = await db.query(
      `SELECT c.*,
              COUNT(i.id)                        AS total_purchases,
              COALESCE(SUM(i.total_amount), 0)   AS total_spent
       FROM customers c
       LEFT JOIN invoices i ON c.id = i.customer_id
       WHERE c.is_active = TRUE
         AND (c.name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1)
       GROUP BY c.id
       ORDER BY c.name`,
      params
    );
    return result.rows;
  }

  async findByIdWithStats(id) {
    const result = await db.query(
      `SELECT c.*,
              COUNT(i.id)                        AS total_purchases,
              COALESCE(SUM(i.total_amount), 0)   AS total_spent,
              MAX(i.created_at)                  AS last_purchase_at
       FROM customers c
       LEFT JOIN invoices i ON c.id = i.customer_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getRecentInvoices(customerId, limit = 10) {
    const result = await db.query(
      `SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [customerId, limit]
    );
    return result.rows;
  }

  async create(data) {
    const { name, phone, email, address } = data;
    const result = await db.query(
      `INSERT INTO customers (name, phone, email, address) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, phone || null, email || null, address || null]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { name, phone, email, address } = data;
    const result = await db.query(
      `UPDATE customers SET name=$1, phone=$2, email=$3, address=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
      [name, phone || null, email || null, address || null, id]
    );
    return result.rows[0];
  }

  async softDelete(id) {
    const result = await db.query(
      `UPDATE customers SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new CustomerRepository();
