const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database/connection');

router.get('/', (req, res) => {
  res.render('recover', { message: null });
});

router.post('/', async (req, res) => {
  const { email, newPassword, confirmPassword, newUsername } = req.body;

  try {
    const [users] = await pool.execute("select user_id FROM users where email = ?", [email]);

    if (users.length === 0) {
      return res.render('recover', { message: 'no account paired with email' });
    }

    // Prepare update fields
    const updates = [];
    const values = [];

    // Handle password update
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        return res.render('recover', { message: 'passwords does not match' });
      }
      if (newPassword.length < 8) {
        return res.render('recover', { message: 'password must be at least 8 characters long' });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      updates.push("password_hash = ?");
      values.push(hash);
    }

    // Handle username update
    if (newUsername) {
      const [existing] = await pool.execute("select user_id FROM users where username = ?", [newUsername]);
      if (existing.length) {
        return res.render('recover', { message: 'that username is already taken.' });
      }
      updates.push("username = ?");
      values.push(newUsername);
    }

    if (updates.length === 0) {
      return res.render('recover', { message: 'please provide a new password or username.' });
    }

    // Finalize query
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE email = ?`;
    values.push(email);

    await pool.execute(sql, values);

    res.redirect('/');
  } catch (err) {
    console.error("Recovery error:", err);
    res.render('recover', { message: 'something bad' });
  }
});

module.exports = router;
