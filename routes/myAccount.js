const express = require('express');
const router = express.Router();
const pool = require('../database/connection');  
const sessionMiddleware = require('./sessionMiddleware');

router.get('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        const [rows] = await pool.execute(
            "SELECT username, email, player_name, created_at, total_points, high_score, bio FROM users WHERE user_id = ?", 
            [req.session.userId]
        );
        
        if (rows.length === 0) return res.status(404).send('User not found.');

        const user = rows[0];

        res.render('myAccount', { 
            user: {
                username: user.username,
                email: user.email,
                player_name: user.player_name,
                account_age: "I'm too stupid for this",
                total_points: user.total_points,
                high_score: user.high_score,
                bio: user.bio
            }
        });
    } catch (err) {
        console.error("Error fetching account details:", err);
        res.status(500).send('Error fetching account details.');
    }
});

module.exports = router;
