const db = require('../config/db');

class AuthRepository {

  async findByEmail(email) {
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async create({ name, email, password }) {
    const result = await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, password]
    );
    return result.rows[0];
  }
}

module.exports = new AuthRepository();
