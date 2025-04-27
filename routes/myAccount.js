const express = require('express');
const router = express.Router();
const pool = require('../database/connection');  
const sessionMiddleware = require('./sessionMiddleware');

/**
 * @swagger
 * /myAccount:
 *   get:
 *     summary: Get the current user's account details
 *     description: Fetches and displays the account details for the logged-in user, including username, email, player name, points, high score, and bio.
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched account details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 player_name:
 *                   type: string
 *                 account_age:
 *                   type: integer
 *                 total_points:
 *                   type: integer
 *                 high_score:
 *                   type: integer
 *                 img_path:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 admin:
 *                   type: boolean
 *       401:
 *         description: Unauthorized: Please log in
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error while fetching account details
 */
router.get('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        const [rows] = await pool.execute(
            "SELECT username, email, player_name, created_at, total_points, high_score, img_path, bio, admin FROM users WHERE user_id = ?", 
            [req.session.userId]
        );
        
        if (rows.length === 0) return res.status(404).send('User not found.');

        const user = rows[0];

        const createdAt = new Date(user.created_at);
        const today = new Date();
        let account_age = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
        account_age = account_age < 0 ? 0 : account_age;

        res.render('myAccount', { 
            user: {
                username: user.username,
                email: user.email,
                player_name: user.player_name,
                account_age: account_age,
                total_points: user.total_points,
                high_score: user.high_score,
                img_path: user.img_path,
                bio: user.bio,
                admin: user.admin
            }
        });
    } catch (err) {
        console.error("Error fetching account details:", err);
        res.status(500).send('Error fetching account details.');
    }
});

module.exports = router;
