const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database/connection');

/**
 * @swagger
 * /recover:
 *   get:
 *     summary: Render the account recovery form
 *     description: Displays the recovery form where users can change their password or username by providing their email.
 *     responses:
 *       200:
 *         description: Successfully rendered the recovery page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', (req, res) => {
  res.render('recover', { message: null });
});
/**
 * @swagger
 * /recover:
 *   post:
 *     summary: Update a user's password and/or username
 *     description: >
 *       Allows a user to reset their password and/or change their username using their registered email address.
 *       This endpoint validates input, ensures the username isn't already taken, and updates the user account accordingly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address associated with the account
 *               newPassword:
 *                 type: string
 *                 description: The new password (must match confirmPassword and be at least 8 characters)
 *               confirmPassword:
 *                 type: string
 *                 description: Must match the new password
 *               newUsername:
 *                 type: string
 *                 description: The new desired username (must not already exist)
 *     responses:
 *       302:
 *         description: Successfully updated and redirected to the home page
 *       400:
 *         description: Validation or user input error (e.g. passwords don't match, username taken)
 *       500:
 *         description: Server error while processing the recovery request
 */



router.post('/', async (req, res) => {
  
  const { email, newPassword, confirmPassword, newUsername } = req.body;

  try {
    const [users] = await pool.execute("select user_id FROM users where email = ?", [email]);

    if (users.length === 0) {
      return res.render('recover', { message: 'No account paired with this email.' });
    }

    // prepare update fields
    const updates = [];
    const values = [];

    // Handle password update
    if (newPassword || confirmPassword) {
      //if password matches
      if (newPassword !== confirmPassword) {
        return res.render('recover', { message: 'Passwords do not match.' });
      }
      if (newPassword.length < 8) {
        return res.render('recover', { message: 'Password must be at least 8 characters long.' });
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
        return res.render('recover', { message: 'That username is already taken.' });
      }
      //username available updates the array by pushing
      updates.push("username = ?");
      values.push(newUsername);
    }
//preven empty update 
    if (updates.length === 0) {
      return res.render('recover', { message: 'Please provide a new password or username.' });
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

/**
 * @swagger
 * /recover/lookup:
 *   post:
 *     summary: Recover username by email
 *     description: >
 *       Allows a user to retrieve their forgotten username by providing their registered email address.
 *       If the email exists, the corresponding username is returned in a rendered message.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The registered email address of the user
 *     responses:
 *       200:
 *         description: Rendered page with username message
 *       404:
 *         description: No account associated with that email
 *       500:
 *         description: Internal server error during username lookup
 */

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
        message: 'No account found with that email.'
      });
    }
    //matching email gets username/expect one row each email is unique or should be
    const username = rows[0].username;
    //gives username in message
    return res.render('recover',{
      message:`Your username is:  '${username}' . If you forgot your password, please use the form above.`
    });
      } catch (err) {
    console.error("username lookup error:", err);
    res.render('recover', {
      message: 'Wrong, try again.'
    });
  }
});


module.exports = router;
