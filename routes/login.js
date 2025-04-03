const express = require('express');
const router = express.Router();
const pool = require('../database/connection');  
const bcrypt = require('bcrypt');

router.get('/', function(req, res) {
  res.render('login', { title: 'Login', error: null });
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render('login', { title: 'Login', error: 'All fields are required.' });
    }

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE username = ?", [username]
        );

        if (rows.length === 0) {
            return res.render('login', { 
                title: 'Login', 
                error: 'Invalid credentials.' 
            });
        }

        const user = rows[0];

        // Check if account is deleted
        if (user.deleted_at !== null) {
            return res.render('login', { 
                title: 'Login', 
                error: 'This account has been deleted. Please contact an admin for account recovery.' 
            });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password_hash);  
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login', 
                error: 'Invalid credentials.' 
            });
        }

        req.session.userId = user.user_id;
        res.redirect('/myAccount');
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send('Error logging in.');
    }
});

module.exports = router;

