const express = require('express');
const router = express.Router();
const pool = require('../database/connection'); 

 /**
 * @swagger
 * /characters:
 *   get:
 *     summary: Renders the characters page.
 *     description: Retrieves all characters from the database and renders the characters page correspondingly.
 *     responses:
 *       200:
 *         description: Correctly rendered characters page.
 *       500:
 *          description: Error fetching from database.
*/
router.get('/', async function (req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM npcs'); 
        res.render('characters', { title: 'Characters', npcs: rows });
    } catch (error) {
        console.error('❌ Error fetching NPCs:', error);
        res.status(500).send('Database error');
    }
});

module.exports = router;
