const express = require('express');
const router = express.Router();
const pool = require('../database/connection');

/**
 * @swagger
 * /players:
 *   get:
 *     summary: Get a list of players
 *     description: Fetches the top 5 players (not deleted) ordered by their username.
 *     responses:
 *       200:
 *         description: Successfully fetched the list of players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   img_path:
 *                     type: string
 *       500:
 */
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

/**
 * @swagger
 * /players/search:
 *   get:
 *     summary: Search for players by username
 *     description: Searches for players whose username matches the query string (case-insensitive).
 *     parameters:
 *       - name: q
 *         in: query
 *         description: The search query for the player's username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   img_path:
 *                     type: string
 *       500:
 *         description: Search failed
 */
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
