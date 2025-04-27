const express = require('express');
const router = express.Router();
const pool = require('../database/connection');  
const bcrypt = require('bcrypt');

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Render the login page
 *     description: Displays the login form for users.
 *     responses:
 *       200:
 *         description: Login page rendered successfully
 */
router.get('/', function(req, res) {
  res.render('login', { title: 'Login', error: null });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user and start a session
 *     description: Verifies user credentials and logs them in if successful. Handles deleted accounts and invalid credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: yourpassword123
 *     responses:
 *       302:
 *         description: Redirects to the user's account page on successful login
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials or deleted account
 *       500:
 *         description: Server error during login
 */
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

        // handle the case that the user account has been soft deleted
        if (user.deleted_at !== null) {
            return res.render('login', { 
                title: 'Login', 
                error: 'This account has been deleted. Please contact an admin for account recovery.' 
            });
        }

        // check that credentials are correct
        const isMatch = await bcrypt.compare(password, user.password_hash);  
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login', 
                error: 'Invalid credentials.' 
            });
        }

        req.session.userId = user.user_id;
        req.session.points = 0;
        req.session.happiness = 50;
        res.redirect('/myAccount');
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send('Error logging in.');
    }
});

module.exports = router;

