const express = require('express');
const router = express.Router();
/**
 * @swagger
 * /instructions:
 *   get:
 *     summary: Display the Instructions page
 *     description: Renders the instructions view that explains how to use the website, including how to log in, sign up, and play the game.
 *     responses:
 *       200:
 *         description: Successfully rendered the instructions page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

router.get('/', (req, res) => {
  res.render('instructions', { title: 'Instructions' });
});

module.exports = router;
