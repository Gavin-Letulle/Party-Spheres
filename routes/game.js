var express = require('express');
var router = express.Router();
const pool = require('../database/connection');  

router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send('Unauthorized: Please log in.');
    }

    const [users] = await pool.execute(
        "SELECT total_points, high_score FROM users WHERE user_id = ?", 
        [req.session.userId]
    );
    const user = users[0];
    res.render(
      'game', { 
        title: 'Game page',
        user
    });
  } catch(error) {
    console.error("Error fetching game data:", error);
    res.status(500).send('Error loading game state.');
  }
});

module.exports = router;