const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/connection');
const router = express.Router();
const sessionMiddleware = require('./sessionMiddleware');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');


/**
 * @swagger
 * /edit:
 *   get:
 *     summary: Display the edit account page for the logged-in user
 *     description: Fetches the current user's account details and a list of available profile images, then renders the edit account page.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched user details and rendered the edit page.
 *       401:
 *         description: Unauthorized - User must be logged in.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error while fetching account details or images.
 */
router.get('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    try {
        // Fetch user details
        const [rows] = await pool.execute(
            "SELECT username, email, player_name, bio, img_path FROM users WHERE user_id = ?", 
            [req.session.userId]
        );

        if (rows.length === 0) return res.status(404).send('User not found.');
        const user = rows[0];

        // Read image files from the images directory
        fs.readdir(IMAGES_DIR, (err, files) => {
            if (err) {
                console.error("Error reading images directory:", err);
                return res.status(500).send("Error loading images.");
            }

            // Filter only valid image files (PNG, JPG)
            const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));

            // Render the edit page and pass the image files
            res.render('edit', { 
                title: 'Edit Account', 
                user,
                images: imageFiles,  // Ensure this is passed here
                error: null
            });
        });

    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).send('Error fetching account details.');
    }
});

/**
 * @swagger
 * /edit:
 *   post:
 *     summary: Update or delete the user's account
 *     description: Allows a logged-in user to update their account details or delete their account. Deletion logs the user out.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               player_name:
 *                 type: string
 *               bio:
 *                 type: string
 *               img_path:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               deleteAccount:
 *                 type: string
 *                 description: If set to 'true', the account will be soft-deleted.
 *     responses:
 *       302:
 *         description: Successfully updated account or deleted account (redirects).
 *       401:
 *         description: Unauthorized - User must be logged in.
 *       500:
 *         description: Server error while updating or deleting account.
 */
router.post('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    // check whether the user has selected to delete their account
    if (req.body.deleteAccount === 'true') {
        try {
            // account deletion is just handled by the deleted_at timestamp column in the database
            await pool.execute(
                "UPDATE users SET deleted_at = NOW() WHERE user_id = ?",
                [req.session.userId]
            );

            // delete the login session and redirect to home page
            req.session.destroy(err => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).send('Error logging out.');
                }
                res.redirect('/');  
            });
        } catch (error) {
            console.error("Error deleting account:", error);
            res.status(500).send('Error deleting account.');
        }
        return;  
    }

    try {
        const { username, email, player_name, bio, password, confirmPassword, img_path } = req.body;

        // handle the case that passwords don't match
        if (password && password !== confirmPassword) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "Passwords do not match.",
                user: req.body,
                images: await getImages()  
            });
        }

        // handle the case that email is already in-use
        const [emailCheck] = await pool.execute(
            "SELECT * FROM users WHERE email = ? AND user_id != ?", 
            [email, req.session.userId]
        );
        if (emailCheck.length > 0) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "This email is already in use by another account.",
                user: req.body,
                images: await getImages()  
            });
        }

        // handle the case that username is already in-use
        const [usernameCheck] = await pool.execute(
            "SELECT * FROM users WHERE username = ? AND user_id != ?", 
            [username, req.session.userId]
        );
        if (usernameCheck.length > 0) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "This username is already taken.",
                user: req.body,
                images: await getImages()  
            });
        }

        // password hashing
        let updatedPassword = null;
        if (password) {
            updatedPassword = await bcrypt.hash(password, 10);
        }

        let updateQuery = `
            UPDATE users 
            SET username = ?, email = ?, player_name = ?, bio = ?, img_path = ? 
        `;

        let updateParams = [username, email, player_name, bio, img_path];

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

async function getImages() {
    return new Promise((resolve, reject) => {
        fs.readdir(IMAGES_DIR, (err, files) => {
            if (err) {
                reject("Error reading images directory.");
            }
            const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
            resolve(imageFiles);
        });
    });
}


module.exports = router;

