const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { UPSERT_LOCATION } = require('../db/queries'); 

router.post('/update', async (req, res, next) => {
    // 1. Get the authenticated user ID (from middleware)
    // If auth is missing, this will fail safely (errorHandler catches it)
    const user_id = req.client ? req.client.id : null; 
    
    // 2. Validate Input
    const { latitude, longitude } = req.body;
    if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
    if (!latitude || !longitude) return res.status(400).json({ error: 'Missing latitude/longitude.' });

    try {
        // 3. Run the optimized UPSERT query
        await pool.query(UPSERT_LOCATION, [user_id, latitude, longitude]);
        
        // 4. Send Success Response
        res.status(200).json({ status: 'success', message: 'Location updated and usage logged.' });
    } catch (err) {
        next(err); // Pass errors to the global error handler
    }
});

module.exports = router;