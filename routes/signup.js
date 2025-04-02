const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/connection');
const router = express.Router();

router.get('/', function(req, res) {
  res.render('signup', { title: 'Signup', error: null });
});

router.post('/', async (req, res) => {
    try {
        const { email, username, password, verifyPassword } = req.body;

        if (password.length < 8) {
            return res.render('signup', { title: 'Signup', error: "Password must be at least 8 characters long." });
        }

        if (!password || !verifyPassword) {
            return res.render('signup', { title: 'Signup', error: "Missing password fields." });
        }

        if (password.trim() !== verifyPassword.trim()) {
            return res.render('signup', { title: 'Signup', error: "Passwords do not match." });
        }

        const [existingEmail] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (existingEmail.length > 0) {
            return res.render('signup', { title: 'Signup', error: "This email is already in use." });
        }

        const [existingUsername] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUsername.length > 0) {
            return res.render('signup', { title: 'Signup', error: "This username is already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)";
        await pool.execute(query, [email, username, hashedPassword]);

        res.redirect('/myAccount');
    } catch (error) {
        console.error("Error registering user:", error);
        res.render('signup', { title: 'Signup', error: "Error creating account." });
    }
});

module.exports = router;
