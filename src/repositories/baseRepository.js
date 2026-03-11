const db = require('../config/db');

/**
 * Base Repository
 * All entity repositories extend this for common query patterns.
 */
class BaseRepository {
  constructor(tableName) {
    this.table = tableName;
    this.db    = db;
  }

  async findAll(options = {}) {
    const { where = '', params = [], orderBy = 'id ASC', limit = null } = options;
    let sql = `SELECT * FROM ${this.table}`;
    if (where)   sql += ` WHERE ${where}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    if (limit)   sql += ` LIMIT ${parseInt(limit)}`;
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      `SELECT * FROM ${this.table} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async count(where = '', params = []) {
    let sql = `SELECT COUNT(*) FROM ${this.table}`;
    if (where) sql += ` WHERE ${where}`;
    const result = await this.db.query(sql, params);
    return parseInt(result.rows[0].count);
  }

  async deleteById(id) {
    const result = await this.db.query(
      `DELETE FROM ${this.table} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = BaseRepository;
