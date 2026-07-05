// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'aa_grow',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅  MySQL connected successfully to database:', process.env.DB_NAME || 'aa_grow');
    conn.release();
  })
  .catch(err => {
    console.error('❌  MySQL connection failed:', err.message);
    console.error('    Check your .env DB_* variables and make sure MySQL is running.');
  });

/**
 * Execute a parameterised query and return [rows, fields].
 * Usage: const [rows] = await query('SELECT * FROM users WHERE id = ?', [id]);
 */
const query = async (sql, params = []) => {
  try {
    return await pool.execute(sql, params);
  } catch (error) {
    console.error('DB Query Error:', error.message);
    throw error;
  }
};

module.exports = { pool, query };
