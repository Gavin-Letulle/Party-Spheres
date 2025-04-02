const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/connection');
const router = express.Router();
const sessionMiddleware = require('./sessionMiddleware');

router.get('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        const [rows] = await pool.execute(
            "SELECT username, email, player_name, bio FROM users WHERE user_id = ?", 
            [req.session.userId]
        );
        
        if (rows.length === 0) return res.status(404).send('User not found.');

        const user = rows[0];

        res.render('edit', { 
            title: 'Edit Account', 
            user: {
                username: user.username,
                email: user.email,
                player_name: user.player_name, 
                bio: user.bio
            },
            error: null
        });
    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).send('Error fetching account details.');
    }
});

router.post('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        const { username, email, player_name, bio, password, confirmPassword } = req.body;

        if (password && password !== confirmPassword) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "Passwords do not match.",
                user: req.body  
            });
        }

        // Check if email is already in use by another user
        const [emailCheck] = await pool.execute(
            "SELECT * FROM users WHERE email = ? AND user_id != ?", 
            [email, req.session.userId]
        );
        if (emailCheck.length > 0) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "This email is already in use by another account.",
                user: req.body
            });
        }

        // Check if username is already in use by another user
        const [usernameCheck] = await pool.execute(
            "SELECT * FROM users WHERE username = ? AND user_id != ?", 
            [username, req.session.userId]
        );
        if (usernameCheck.length > 0) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "This username is already taken.",
                user: req.body
            });
        }

        // Hash the new password if it's provided
        let updatedPassword = null;
        if (password) {
            updatedPassword = await bcrypt.hash(password, 10);
        }

        // Create the base update query
        let updateQuery = `
            UPDATE users 
            SET username = ?, email = ?, player_name = ?, bio = ? 
        `;

        // If a password is being updated, add the password_hash field to the query
        let updateParams = [username, email, player_name, bio];

        if (updatedPassword) {
            updateQuery += `, password_hash = ?`; 
            updateParams.push(updatedPassword);  
        }

        updateQuery += ` WHERE user_id = ?`;

        updateParams.push(req.session.userId);

        await pool.execute(updateQuery, updateParams);

        res.redirect('/myAccount');
    } catch (error) {
        console.error("Error updating account details:", error);
        res.status(500).send('Error updating account details.');
    }
});

module.exports = router;