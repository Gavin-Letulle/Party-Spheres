const express = require('express');
const router = express.Router();
const pool = require('../database/connection');
const sessionMiddleware = require('./sessionMiddleware');

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Render admin panel
 *     description: Requires the user to be an admin. Otherwise, access is denied.
 *     responses:
 *       200:
 *         description: Admin panel rendered successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /admin/search:
 *   get:
 *     summary: Search for users
 *     description: Admin-only search across usernames, including deleted users.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for usernames
 *     responses:
 *       200:
 *         description: Renders the list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   img_path:
 *                     type: string
 *                   deleted_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   admin:
 *                     type: string
 *                     enum: [true, false]
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /admin/soft-delete/{userId}:
 *   post:
 *     summary: Soft delete a user
 *     description: Marks a user as deleted by setting deleted_at timestamp. Admin-only access.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to soft delete
 *     responses:
 *       302:
 *         description: Redirects to admin panel
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /admin/recover/{userId}:
 *   post:
 *     summary: Recover a soft-deleted user
 *     description: Removes deleted_at timestamp to recover a user. Admin-only access.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to recover
 *     responses:
 *       302:
 *         description: Correctly redirects to admin panel
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /admin/delete/{userId}:
 *   post:
 *     summary: Permanently delete a user
 *     description: Permanently deletes a user record from the database. Admin-only access.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to permanently delete
 *     responses:
 *       302:
 *         description: Correctly redirects to admin panel
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /admin/make-admin/{userId}:
 *   post:
 *     summary: Make a user an admin
 *     description: Grants admin privileges to a user. Admin-only access.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to promote
 *     responses:
 *       302:
 *         description: Redirects to admin panel
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /admin/remove-admin/{userId}:
 *   post:
 *     summary: Remove admin privileges from a user
 *     description: Revokes admin status from a user. Admin-only access.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to demote
 *     responses:
 *       302:
 *         description: Redirects to admin panel
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
