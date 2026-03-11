const { Pool } = require('pg');

let pool;

if (process.env.NODE_ENV === 'production') {
  // 🚀 Production (Railway)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log("🌍 Using Railway Production Database");

} else {
  // 💻 Local Development
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || '123456'),
    database: process.env.DB_NAME || 'medistore',
  });

  console.log("🛠 Using Local PostgreSQL Database");
}

// Global error handler
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
  process.exit(1);
});

// Optional: Log once when connected
pool.connect()
  .then(client => {
    console.log("✅ PostgreSQL pool connected");
    client.release();
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
  });

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };