const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { FIND_NEARBY } = require('../db/queries'); 

router.post('/', async (req, res, next) => {
    const { target_lon, target_lat, radius_meters, limit } = req.body;
    
    // 1. Validate Input
    if (!target_lon || !target_lat) {
        return res.status(400).json({ error: 'Target coordinates (target_lon, target_lat) are required.' });
    }

    try {
        // 2. Run the Proximity Query
        // Defaults: 5000 meters (5km) radius, limit 50 results
        const result = await pool.query(FIND_NEARBY, [
            parseFloat(target_lon),
            parseFloat(target_lat),
            parseFloat(radius_meters || 5000),
            parseInt(limit || 50)
        ]);

        // 3. Send Data Response
        res.status(200).json({
            count: result.rows.length,
            radius_meters: radius_meters || 5000,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;