const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const crypto = require('crypto');

router.post('/token', async (req, res, next) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Client name is required.' });

    try {
        const apiKey = crypto.randomBytes(16).toString('hex');
        
        const result = await pool.query(
            `INSERT INTO clients (name, api_key) VALUES ($1, $2)
             RETURNING id, name, api_key`,
            [name, apiKey]
        );

        const newClient = result.rows[0];
        res.status(201).json({
            api_key: newClient.api_key,
            client: {
                id: newClient.id,
                name: newClient.name
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;