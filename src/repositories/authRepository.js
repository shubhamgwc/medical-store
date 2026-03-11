const db = require('../config/db');

class AuthRepository {

  async findByEmail(email) {
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const { first_name, last_name, email, password, phone } = data;

    const result = await db.query(
      `INSERT INTO users 
       (first_name, last_name, email, password, phone) 
       VALUES ($1,$2,$3,$4,$5) 
       RETURNING id, first_name, last_name, email`,
      [
        first_name,
        last_name || null,
        email,
        password,
        phone || null
      ]
    );

    return result.rows[0];
  }
}

module.exports = new AuthRepository();