const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { validateApiKey } = require('../middleware/authMiddleware');

// GET /usage/today - Returns today's request count for the authenticated client
router.get('/today', validateApiKey, async (req, res, next) => {
    try {
        const clientId = req.client.id;
        const result = await pool.query(
            `SELECT COUNT(*) AS requests_today
             FROM api_usage
             WHERE client_id = $1
               AND request_time >= date_trunc('day', NOW())`,
            [clientId]
        );
        res.json({ requests_today: parseInt(result.rows[0].requests_today, 10) });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
