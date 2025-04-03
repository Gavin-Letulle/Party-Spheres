const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database/connection');
const router = express.Router();
const sessionMiddleware = require('./sessionMiddleware');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');

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

router.post('/', sessionMiddleware, async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in.');
    }

    // Check if the deleteAccount parameter is present
    if (req.body.deleteAccount === 'true') {
        try {
            // Update the deleted_at column with the current timestamp
            await pool.execute(
                "UPDATE users SET deleted_at = NOW() WHERE user_id = ?",
                [req.session.userId]
            );

            // Destroy the session to log the user out
            req.session.destroy(err => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).send('Error logging out.');
                }
                res.redirect('/');  // Redirect to homepage or login page after deletion
            });
        } catch (error) {
            console.error("Error deleting account:", error);
            res.status(500).send('Error deleting account.');
        }
        return;  // Ensure the function exits here if account is being deleted
    }

    try {
        const { username, email, player_name, bio, password, confirmPassword, img_path } = req.body;

        if (password && password !== confirmPassword) {
            return res.render('edit', { 
                title: 'Edit Account', 
                error: "Passwords do not match.",
                user: req.body,
                images: await getImages()  // Ensure images are passed even on error
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
                user: req.body,
                images: await getImages()  // Ensure images are passed even on error
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
                user: req.body,
                images: await getImages()  // Ensure images are passed even on error
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
            SET username = ?, email = ?, player_name = ?, bio = ?, img_path = ? 
        `;

        // If a password is being updated, add the password_hash field to the query
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

