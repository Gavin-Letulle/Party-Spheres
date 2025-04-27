const express = require('express');
const router = express.Router();
const pool = require('../database/connection'); 

/**
 * @swagger
 * /characters/{npc_id}:
 *   get:
 *     summary: Get character details by NPC ID
 *     description: Retrieves information about a specific NPC, including their name, bio, and reaction preferences.
 *     parameters:
 *       - in: path
 *         name: npc_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the NPC to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved character data and rendered the character page.
 *       404:
 *         description: Character not found.
 *       500:
 *         description: Server error.
 */
router.get('/:npc_id', async (req, res) => {
    const { npc_id } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT npc_name, bio, likes_compliments, likes_help, likes_invites, img_path 
             FROM npcs 
             WHERE npc_id = ?`, 
            [npc_id]
        );

        if (rows.length === 0) {
            return res.status(404).send('Character not found');
        }

        const character = rows[0];

        const likes = [];
        const dislikes = [];
        const neutral = [];

        const reactions = {
            Compliments: character.likes_compliments,
            Help: character.likes_help,
            Invites: character.likes_invites
        };

        for (const [reaction, value] of Object.entries(reactions)) {
            if (value === 'true') {
                likes.push(reaction);
            } else if (value === 'false') {
                dislikes.push(reaction);
            } else {
                neutral.push(reaction);
            }
        }

        res.render('character', { character, likes, dislikes, neutral });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


module.exports = router;