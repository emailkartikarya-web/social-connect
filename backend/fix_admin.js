require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function fix() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'admin@eventhub360.com']);
  console.log('Done, hash:', hash);
  process.exit();
}

fix();