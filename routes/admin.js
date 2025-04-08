const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const sessionMiddleware = require('./sessionMiddleware');

// Render admin panel (must be admin)
router.get('/', sessionMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);

        if (rows.length === 0 || rows[0].admin !== 'true') {
            return res.status(403).send("Access denied.");
        }

        res.render('admin', { title: 'Admin Panel' });
    } catch (err) {
        console.error("Error verifying admin:", err);
        res.status(500).send("Server error.");
    }
});

// Search users (including deleted)
router.get('/search', sessionMiddleware, async (req, res) => {
    const { q } = req.query;

    try {
        const [adminCheck] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);
        if (adminCheck.length === 0 || adminCheck[0].admin !== 'true') {
            return res.status(403).json({ error: "Access denied." });
        }

        const [users] = await pool.execute(
            `SELECT user_id, username, img_path, deleted_at, admin 
             FROM users 
             WHERE LOWER(username) LIKE LOWER(?) 
             ORDER BY username ASC LIMIT 10`,
            [`%${q}%`]
        );

        res.json(users);
    } catch (err) {
        console.error("Error searching users:", err);
        res.status(500).json({ error: "Failed to search users." });
    }
});

// Soft delete user
router.post('/soft-delete/:userId', sessionMiddleware, async (req, res) => {
    const { userId } = req.params;

    try {
        const [adminCheck] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);
        if (adminCheck.length === 0 || adminCheck[0].admin !== 'true') {
            return res.status(403).send("Access denied.");
        }

        await pool.execute("UPDATE users SET deleted_at = NOW() WHERE user_id = ?", [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error("Error soft-deleting user:", err);
        res.status(500).send("Error soft-deleting user.");
    }
});

// Recover user
router.post('/recover/:userId', sessionMiddleware, async (req, res) => {
    const { userId } = req.params;

    try {
        const [adminCheck] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);
        if (adminCheck.length === 0 || adminCheck[0].admin !== 'true') {
            return res.status(403).send("Access denied.");
        }

        await pool.execute("UPDATE users SET deleted_at = NULL WHERE user_id = ?", [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error("Error recovering user:", err);
        res.status(500).send("Error recovering user.");
    }
});

// Permanently delete user
router.post('/delete/:userId', sessionMiddleware, async (req, res) => {
    const { userId } = req.params;

    try {
        const [adminCheck] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);
        if (adminCheck.length === 0 || adminCheck[0].admin !== 'true') {
            return res.status(403).send("Access denied.");
        }

        await pool.execute("DELETE FROM users WHERE user_id = ?", [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error("Error permanently deleting user:", err);
        res.status(500).send("Error deleting user.");
    }
});

// Make user an admin
router.post('/make-admin/:userId', sessionMiddleware, async (req, res) => {
    const { userId } = req.params;

    try {
        const [adminCheck] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);
        if (adminCheck.length === 0 || adminCheck[0].admin !== 'true') {
            return res.status(403).send("Access denied.");
        }

        await pool.execute("UPDATE users SET admin = 'true' WHERE user_id = ?", [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error("Error making user an admin:", err);
        res.status(500).send("Error making user an admin.");
    }
});

// Remove admin status
router.post('/remove-admin/:userId', sessionMiddleware, async (req, res) => {
    const { userId } = req.params;

    try {
        const [adminCheck] = await pool.execute("SELECT admin FROM users WHERE user_id = ?", [req.session.userId]);
        if (adminCheck.length === 0 || adminCheck[0].admin !== 'true') {
            return res.status(403).send("Access denied.");
        }

        await pool.execute("UPDATE users SET admin = 'false' WHERE user_id = ?", [userId]);
        res.redirect('/admin');
    } catch (err) {
        console.error("Error removing admin status:", err);
        res.status(500).send("Error removing admin status.");
    }
});

module.exports = router;
