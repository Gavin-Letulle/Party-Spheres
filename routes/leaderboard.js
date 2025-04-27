const express = require('express');
const pool = require('../database/connection');
const router = express.Router();

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get the top 10 users by high score
 *     description: Retrieves and displays the top 10 users sorted by their high scores
 *     responses:
 *       200:
 *         description: Leaderboard page rendered successfully
 *       500:
 *         description: Server error loading leaderboard
 */
router.get('/', async (req, res) => {
    try {
        const [users] = await pool.execute(
            "SELECT user_id, username, high_score, img_path FROM users WHERE deleted_at IS NULL ORDER BY high_score DESC LIMIT 10"
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