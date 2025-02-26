var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('leaderboard', { title: 'Leaderboard' });
});

module.exports = router;