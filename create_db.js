const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.DB_DATABASE || 'nodeloc_db';

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    console.log(`Connecting to server to ensure database '${dbName}' exists...`);
    await client.connect();

    const res = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [dbName]);
    if (res.rowCount > 0) {
      console.log(`Database '${dbName}' already exists.`);
      process.exit(0);
    }

    console.log(`Creating database '${dbName}'...`);
    await client.query(`CREATE DATABASE ${dbName};`);
    console.log(`✅ Database '${dbName}' created.`);
  } catch (err) {
    console.error('Failed to create database:');
    console.error(err.message || err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
