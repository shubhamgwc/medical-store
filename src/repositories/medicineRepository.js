const BaseRepository = require('./baseRepository');
const db = require('../config/db');

class MedicineRepository extends BaseRepository {
  constructor() {
    super('medicines');
  }

  async search({ search, category } = {}) {
    const params = [];
    const conds  = ['is_active = TRUE'];

    if (search) {
      params.push(`%${search}%`);
      conds.push(`(name ILIKE $${params.length} OR generic_name ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conds.push(`category = $${params.length}`);
    }

    const sql = `
      SELECT * FROM medicines
      WHERE ${conds.join(' AND ')}
      ORDER BY name ASC
    `;
    const result = await db.query(sql, params);
    return result.rows;
  }

  async getCategories() {
    const result = await db.query(
      `SELECT DISTINCT category FROM medicines WHERE category IS NOT NULL AND is_active = TRUE ORDER BY category`
    );
    return result.rows.map(r => r.category);
  }

  async getInStock() {
    const result = await db.query(
      `SELECT * FROM medicines WHERE stock_quantity > 0 AND is_active = TRUE ORDER BY name`
    );
    return result.rows;
  }

  async getLowStock() {
    const result = await db.query(
      `SELECT * FROM medicines WHERE stock_quantity <= min_stock_alert AND is_active = TRUE ORDER BY stock_quantity ASC`
    );
    return result.rows;
  }

  async getExpiringSoon(days = 30) {
    const result = await db.query(
      `SELECT * FROM medicines
       WHERE expiry_date <= CURRENT_DATE + INTERVAL '${parseInt(days)} days'
         AND expiry_date >= CURRENT_DATE
         AND is_active = TRUE
       ORDER BY expiry_date ASC`
    );
    return result.rows;
  }

  async create(data) {
    const {
      name, generic_name, manufacturer, category, unit,
      purchase_price, selling_price, stock_quantity,
      min_stock_alert, expiry_date, batch_number, description,
    } = data;
    const result = await db.query(
      `INSERT INTO medicines
         (name, generic_name, manufacturer, category, unit,
          purchase_price, selling_price, stock_quantity,
          min_stock_alert, expiry_date, batch_number, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [name, generic_name, manufacturer, category, unit,
       purchase_price, selling_price, stock_quantity || 0,
       min_stock_alert || 10, expiry_date || null, batch_number, description]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const {
      name, generic_name, manufacturer, category, unit,
      purchase_price, selling_price, stock_quantity,
      min_stock_alert, expiry_date, batch_number, description,
    } = data;
    const result = await db.query(
      `UPDATE medicines
       SET name=$1, generic_name=$2, manufacturer=$3, category=$4, unit=$5,
           purchase_price=$6, selling_price=$7, stock_quantity=$8,
           min_stock_alert=$9, expiry_date=$10, batch_number=$11,
           description=$12, updated_at=NOW()
       WHERE id=$13
       RETURNING *`,
      [name, generic_name, manufacturer, category, unit,
       purchase_price, selling_price, stock_quantity,
       min_stock_alert || 10, expiry_date || null, batch_number, description, id]
    );
    return result.rows[0];
  }

  async adjustStock(client, medicineId, quantityChange, type, reason, referenceId = null) {
    const current = await client.query(
      `SELECT stock_quantity FROM medicines WHERE id = $1 FOR UPDATE`, [medicineId]
    );
    if (!current.rows.length) throw new Error(`Medicine ${medicineId} not found`);

    const prevStock = current.rows[0].stock_quantity;
    const newStock  = prevStock + quantityChange;

    if (newStock < 0) throw new Error(`Insufficient stock. Available: ${prevStock}`);

    await client.query(
      `UPDATE medicines SET stock_quantity = $1, updated_at = NOW() WHERE id = $2`,
      [newStock, medicineId]
    );

    await client.query(
      `INSERT INTO stock_adjustments
         (medicine_id, adjustment_type, quantity_change, previous_stock, new_stock, reason, reference_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [medicineId, type, quantityChange, prevStock, newStock, reason, referenceId]
    );

    return { prevStock, newStock };
  }

  async softDelete(id) {
    const result = await db.query(
      `UPDATE medicines SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new MedicineRepository();
