var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Render the homepage
 *     description: Displays the homepage view.
 *     responses:
 *       200:
 *         description: Home page rendered successfully
 */
router.get('/', function(req, res) {
  res.render('home', { title: 'Home' });
});

module.exports = router;
