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

        // Calculate account age
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const diffMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
        const account_age = diffMonths > 1 ? `${diffMonths} Months` : `${diffMonths} Month`;

        res.render('profile', { user, account_age });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

