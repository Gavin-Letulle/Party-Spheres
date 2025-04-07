var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('players', { title: 'Players page' });
});

module.exports = router;