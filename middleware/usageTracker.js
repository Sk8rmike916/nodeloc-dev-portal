const pool = require('../db/pool');

/**
 * Middleware to log successful API calls to the api_usage table.
 * This runs after the route handler successfully sends a response.
 */
exports.trackUsage = async (req, res, next) => {
    // We only log usage for authenticated users. 
    // This runs after the route handler, so we check if the response was sent.
    if (!req.client) {
        // If req.client is missing (e.g., public route or authentication failed)
        return next(); 
    }

    // Capture the endpoint path (e.g., /locations/update or /locations/nearby)
    // We use req.originalUrl and strip query parameters for a clean endpoint name.
    const endpoint = req.originalUrl.split('?')[0];

    // SQL to insert the usage record
    const query = `
        INSERT INTO api_usage (client_id, endpoint)
        VALUES ($1, $2);
    `;
    const values = [req.client.id, endpoint];

    try {
        // Use pool.query (Fire and Forget) to avoid blocking the client's response.
        // The client has already received their data at this point.
        await pool.query(query, values);
        console.log(`[Usage] Logged successful call for Client ${req.client.id} to ${endpoint}`);
    } catch (error) {
        // Log the error internally, but do not interrupt the already successful response.
        console.error(`[Usage Error] Could not log API usage for Client ${req.client.id}:`, error.message);
    }
    
    // Crucial: Always call next() to finish the middleware chain.
    next(); 
};
