require('dotenv').config({ path: '.env.test' });

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('✅ Connected to test database');
    return client.query('SELECT * FROM users');
  })
  .then(res => {
    console.log('📦 Users:', res.rows);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  })
  .finally(() => {
    client.end();
  });
