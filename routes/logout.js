const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out the current user
 *     description: Destroys the user's session and redirects to the login page.
 *     responses:
 *       302:
 *         description: Successfully logged out and redirected to login page
 *       500:
 *         description: Error occurred while logging out
 */
router.post('/', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

module.exports = router;
