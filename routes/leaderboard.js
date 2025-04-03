const express = require('express');
const pool = require('../database/connection');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [users] = await pool.execute(
            "SELECT user_id, username, high_score, img_path FROM users ORDER BY high_score DESC LIMIT 10"
        );

        res.render('leaderboard', { 
            title: 'Leaderboard', 
            users
        });

    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        res.status(500).send('Error loading leaderboard.');
    }
});

module.exports = router;
