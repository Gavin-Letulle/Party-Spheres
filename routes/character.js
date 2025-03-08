var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('character', { title: 'Character Page' });
});

module.exports = router;