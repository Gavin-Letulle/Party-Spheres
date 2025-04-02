const express = require('express');
const router = express.Router();
const pool = require('../database/connection');  
const bcrypt = require('bcrypt');

router.get('/', function(req, res) {
  res.render('login', { title: 'Login' });
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('All fields required.');

    try {
        const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) return res.status(401).send('Invalid credentials.');

        const user = rows[0];  
        const isMatch = await bcrypt.compare(password, user.password_hash);  

        if (!isMatch) return res.status(401).send('Invalid credentials.');

        req.session.userId = user.user_id;
        res.redirect('/myAccount');
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send('Error logging in.');
    }
});

module.exports = router;
