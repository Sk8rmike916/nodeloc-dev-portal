const pool = require('../db/pool'); 

exports.validateApiKey = async (req, res, next) => {
    // 1. Check for Header
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing x-api-key header.' });
    }

    try {
        // 2. Validate against Database
        const result = await pool.query(
            'SELECT id, name FROM clients WHERE api_key = $1 AND is_active = TRUE',
            [apiKey]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid API Key.' });
        }

        // 3. Attach Client Info (Critical for updateLocation.js)
        req.client = result.rows[0]; 
        next(); 

    } catch (err) {
        next(err);
    }
};