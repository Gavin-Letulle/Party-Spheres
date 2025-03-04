var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('account', { title: 'Account' });
});

router.get('/edit', function(req, res) {
  res.render('edit', { title: 'Edit' });
});

module.exports = router;