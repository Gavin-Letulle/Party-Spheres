const express = require('express');
const router = express.Router();
const pool = require('../database/connection'); 

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