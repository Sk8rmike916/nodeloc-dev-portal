const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function setupDatabase() {
    let client;
    try {
        console.log("Attempting to connect to PostgreSQL...");
        client = await pool.connect();

        // 1. Enable PostGIS (CRITICAL STEP A)
        console.log("1. Running: CREATE EXTENSION postgis;");
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        console.log("✅ PostGIS extension is active or was created successfully.");

        // 2. Verify PostGIS (CRITICAL STEP B)
        const versionResult = await client.query('SELECT postgis_full_version() AS version;');
        console.log(`✅ PostGIS Version Confirmed: ${versionResult.rows[0].version.substring(0, 50)}...`);

        // 3. Run the entire schema file content (CRITICAL STEP C)
        const fs = require('fs');
        const schemaSQL = fs.readFileSync('sql/schema.sql', 'utf8');
        
        // Note: Running the whole script again is safe because of IF NOT EXISTS
        // and the trigger creation is fine.
        console.log("2. Running entire schema.sql content (creates tables/indexes)...");
        await client.query(schemaSQL);
        console.log("✅ All tables (clients, locations) and the GiST index are created.");

        // 4. Final verification
        const tableCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('clients', 'locations');");
        console.log(`✅ Verification: Found tables: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);


    } catch (err) {
        console.error("❌ DATABASE SETUP FAILED:");
        console.error(err.stack);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end(); // Close the pool after setup
    }
}

setupDatabase();
