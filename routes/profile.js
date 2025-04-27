const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

/**
 * @swagger
 * /profile/{user_id}:
 *   get:
 *     summary: Get a user's profile
 *     description: Fetches the profile of a user by their user_id.
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: The ID of the user whose profile is being fetched
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully fetched the user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 player_name:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 total_points:
 *                   type: integer
 *                 high_score:
 *                   type: integer
 *                 bio:
 *                   type: string
 *                 img_path:
 *                   type: string
 *                 account_age:
 *                   type: integer
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error while fetching user profile
 */
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
        const today = new Date();
        let account_age = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
        account_age = account_age < 0 ? 0 : account_age;

        res.render('profile', { user, account_age});
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
