var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('game', { title: 'Game page' });
});

module.exports = router;