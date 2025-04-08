const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

router.get('/', async (req, res) => {
    try {
        const [players] = await pool.execute(
            `SELECT user_id, username, img_path 
             FROM users 
             WHERE deleted_at IS NULL
             ORDER BY username ASC
             LIMIT 5`
        );
        res.render('players', { title: 'Players', players });
    } catch (error) {
        console.error("Error loading players page:", error);
        res.status(500).send('Error loading players.');
    }
});

router.get('/search', async (req, res) => {
    const { q } = req.query;

    try {
        const [results] = await pool.execute(
            `SELECT user_id, username, img_path 
             FROM users 
             WHERE deleted_at IS NULL AND LOWER(username) LIKE LOWER(?)
             ORDER BY username ASC
             LIMIT 5`,
            [`%${q}%`]
        );
        res.json(results);
    } catch (error) {
        console.error("Error searching players:", error);
        res.status(500).json({ error: "Search failed." });
    }
});

module.exports = router;
