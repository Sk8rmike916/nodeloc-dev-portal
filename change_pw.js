const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const newPassword = process.argv[2];
if (!newPassword) {
  console.error('Usage: node change_pw.js <new_password>');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  let client;
  try {
    console.log('Connecting with credentials from .env...');
    client = await pool.connect();

    const dbUser = process.env.DB_USER;
    const safePassword = newPassword.replace(/'/g, "''");
    console.log(`Running: ALTER USER ${dbUser} WITH PASSWORD '<redacted>';`);
    await client.query(`ALTER USER ${dbUser} WITH PASSWORD '${safePassword}';`);
    console.log('✅ Password changed on the server.');

    // Update .env DB_PASSWORD line
    const envPath = './.env';
    let env = fs.readFileSync(envPath, 'utf8');
    if (/^DB_PASSWORD=/m.test(env)) {
      env = env.replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${newPassword}`);
    } else {
      env += `\nDB_PASSWORD=${newPassword}\n`;
    }
    fs.writeFileSync(envPath, env, 'utf8');
    console.log('✅ Updated .env DB_PASSWORD.');

  } catch (err) {
    console.error('❌ Failed to change password:');
    console.error(err.message || err.stack);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
