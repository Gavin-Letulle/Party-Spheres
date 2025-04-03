const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); 
    }
    res.redirect('/myAccount'); 
});

module.exports = router;
