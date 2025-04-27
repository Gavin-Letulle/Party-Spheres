const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/connection');
const router = express.Router();

/**
 * @swagger
 * /signup:
 *   get:
 *     summary: Display signup page
 *     description: Renders the signup page where users can create a new account.
 *     responses:
 *       200:
 *         description: Successfully rendered the signup page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', function(req, res) {
  res.render('signup', { title: 'Signup', error: null });
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create a new user account
 *     description: Registers a new user by providing email, username, and password. 
 *                  Validates and hashes the password, checks for unique email and username, 
 *                  and stores the new account in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               username:
 *                 type: string
 *                 description: The username chosen by the user
 *               password:
 *                 type: string
 *                 description: The user's password
 *               verifyPassword:
 *                 type: string
 *                 description: Password confirmation field
 *     responses:
 *       200:
 *         description: Successfully created the user account and redirected to the account page
 *       400:
 *         description: Error during signup process, such as missing fields or password mismatch
 *       500:
 *         description: Error creating the user account due to a server or database issue
 */
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

        // handle the case that the email is associated with an active or soft-deleted account
        const [emailCheck] = await pool.execute("SELECT deleted_at FROM users WHERE email = ?", [email]);
        if (emailCheck.length > 0) {
            if (emailCheck[0].deleted_at === null) {
                return res.render('signup', { title: 'Signup', error: "This email is already in use." });
            } else {
                return res.render('signup', { title: 'Signup', error: "This email is currently associated with a deleted account. Please contact an admin for account recovery." });
            }
        }

        // handle the case that username is used by active or soft-deleted account
        const [usernameCheck] = await pool.execute("SELECT deleted_at FROM users WHERE username = ?", [username]);
        if (usernameCheck.length > 0) {
            if (usernameCheck[0].deleted_at === null) {
                return res.render('signup', { title: 'Signup', error: "This username is already taken." });
            } else {
                return res.render('signup', { title: 'Signup', error: "This username is currently associated with a deleted account. Please contact an admin for account recovery." });
            }
        }

        // hash the password and insert the new user
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
