const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT username, player_name, created_at, total_points, high_score, bio, img_path 
             FROM users 
             WHERE user_id = ?`, 
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = rows[0];

        const createdAt = new Date(user.created_at);
        console.log(createdAt);
        const today = new Date();
        console.log(today);
        const account_age = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));

        res.render('profile', { user, account_age});
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
