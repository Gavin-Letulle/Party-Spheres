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

        if (!password || !verifyPassword) {
            return res.render('signup', { title: 'Signup', error: "Missing password fields." });
        }

        if (password.length < 8) {
            return res.render('signup', { title: 'Signup', error: "Password must be at least 8 characters long." });
        }

        if (password.trim() !== verifyPassword.trim()) {
            return res.render('signup', { title: 'Signup', error: "Passwords do not match." });
        }

        // Check if email is used by active or deleted account
        const [emailCheck] = await pool.execute("SELECT deleted_at FROM users WHERE email = ?", [email]);
        if (emailCheck.length > 0) {
            if (emailCheck[0].deleted_at === null) {
                return res.render('signup', { title: 'Signup', error: "This email is already in use." });
            } else {
                return res.render('signup', { title: 'Signup', error: "This email is currently associated with a deleted account. Please contact an admin for account recovery." });
            }
        }

        // Check if username is used by active or deleted account
        const [usernameCheck] = await pool.execute("SELECT deleted_at FROM users WHERE username = ?", [username]);
        if (usernameCheck.length > 0) {
            if (usernameCheck[0].deleted_at === null) {
                return res.render('signup', { title: 'Signup', error: "This username is already taken." });
            } else {
                return res.render('signup', { title: 'Signup', error: "This username is currently associated with a deleted account. Please contact an admin for account recovery." });
            }
        }

        // Hash the password and insert the new user
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
