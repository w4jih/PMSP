require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM users');
    console.log('Users:', res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
