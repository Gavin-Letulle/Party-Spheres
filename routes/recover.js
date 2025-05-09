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

    // prepare update fields
    const updates = [];
    const values = [];

    // Handle password update
    if (newPassword || confirmPassword) {
      //if password matches
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
    //if user made a new username then select,if already exist message and this would be indicates with a non empty array/
    //
    if (newUsername) {
      const [existing] = await pool.execute("select user_id FROM users where username = ?", [newUsername]);
      if (existing.length) {
        return res.render('recover', { message: 'that username is already taken.' });
      }
      //username available updates the array by pushing
      updates.push("username = ?");
      values.push(newUsername);
    }
//preven empty update 
    if (updates.length === 0) {
      return res.render('recover', { message: 'please provide a new password or username.' });
    }

    // update query
    //updates becomes password_hash, username that are both changed and add the email 
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE email = ?`;
    values.push(email);

    await pool.execute(sql, values);

    res.redirect('/');
  } catch (err) {
    console.error("Recovery error:", err);
    res.render('recover', { message: 'something bad' });
  }
});

router.post('/lookup', async(req,res) => {
  //uses email as a variable but destructs it 
  const{email} = req.body;

  try{
    const [rows] = await pool.execute(
      "select username from users where email = ?",
      [email] //inserts email value
    );
    if (rows.length ===0){
      return res.render('recover',{
        messagee: 'no account found with that email'
      });
    }
    //matching email gets username/expect one row each email is unique or should be
    const username = rows[0].username;
    //gives username in message
    return res.render('recover',{
      message:`username is:${username}.If you forgot the password use the form above.`
    });
      } catch (err) {
    console.error("username lookup error:", err);
    res.render('recover', {
      message: 'wrong try again '
    });
  }
});


module.exports = router;
