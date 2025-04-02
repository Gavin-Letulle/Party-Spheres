const express = require('express');
const router = express.Router();

const sessionMiddleware = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    next();
};

module.exports = sessionMiddleware;