const express = require('express');
const router = express.Router();
const pool = require('../database/connection'); 

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
