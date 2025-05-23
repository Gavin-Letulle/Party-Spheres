var express = require('express');
var router = express.Router();
const pool = require('../database/connection');  

// Shuffles around the passed in array
function shuffleArray(array){
  for (var i = array.length - 1; i > 0; i--) {
      var rand = Math.floor(Math.random() * (i + 1));
      [array[i], array[rand]] = [array[rand], array[i]]
  }
}

// Returns 9 random NPCs
async function randomNpcs() {
  const [npcs] = await pool.query(
    "SELECT * FROM npcs",
  );
  shuffleArray(npcs);
  let circle1 = npcs.slice(0, 3);
  let circle2 = npcs.slice(3, 6);
  let circle3 = npcs.slice(6, 9);
  return [circle1, circle2, circle3];
}

// Retrieves a user (their total points and high score attributes) from the users table based on a passed in user ID
async function getUser(userId) {
  const [users] = await pool.execute(
    "SELECT total_points, high_score FROM users WHERE user_id = ?", 
    [userId]
  );
  return users[0];
}

 /**
 * @swagger
 * /game:
 *   get:
 *     summary: Renders the main game page.
 *     description: Retrieves current game state (or creates new state if no game was already present) and renders the main game page.
 *     responses:
 *       200:
 *         description: Correctly rendered game page.
 *       500:
 *          description: Error loading game state.
*/
router.get('/', async (req, res) => {
  try {
    // For guests (not logged in)
    if (!req.session.userId) {
      if (!req.session.points && !req.session.happiness) {
        req.session.points = 0;
        req.session.happiness = 50;
      }

      if (!req.session.highScore) {
        req.session.highScore = 0;
      }

      const [circle1, circle2, circle3] = await randomNpcs();

      res.render(
        'game', { 
          title: 'Game page',
          highScore: req.session.highScore,
          points: req.session.points,
          happiness: req.session.happiness,
          circle1,
          circle2,
          circle3,
          showLoginPopup: true //flag by ejs for popup and triggers
      });
    // For logged in users
    } else {
      const user = await getUser(req.session.userId);

      req.session.highScore = user.high_score;
      const [circle1, circle2, circle3] = await randomNpcs();

      res.render(
        'game', { 
          title: 'Game page',
          highScore: req.session.highScore,
          points: req.session.points,
          happiness: req.session.happiness,
          circle1,
          circle2,
          circle3,
          showLoginPopup: true //same thing as before

      });
    }
  } catch(error) {
    console.error("Error fetching game data:", error);
    res.status(500).send('Error loading game state.');
  }
});

/**
 * @swagger
 * /game/action:
 *   post:
 *     summary: Execute an action on a circle of NPCs
 *     description: |
 *       Applies the specified action (compliment, invite, help) to each NPC in the circle.
 *       Updates user session values such as points, high score, and happiness.
 *        Also retrieves a randomized set of NPCs and injects a popup login status flag (`showLoginPopup`) for EJS views.  
 *   requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [compliment-button, invite-button, help-button]
 *                 description: Action to perform on each NPC
 *               circle:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     likes_compliments:
 *                       type: string
 *                       enum: ['true', 'false', 'neutral']
 *                       description: NPC's response to compliments
 *                     likes_invites:
 *                       type: string
 *                       enum: ['true', 'false', 'neutral']
 *                       description: NPC's response to invites
 *                     likes_help:
 *                       type: string
 *                       enum: ['true', 'false', 'neutral']
 *                       description: NPC's response to help
 *     responses:
 *       200:
 *         description: Game state updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPoints:
 *                   type: integer
 *                 highScore:
 *                   type: integer
 *                 happiness:
 *                   type: integer
 *                 circle1:
 *                   type: array
 *                   items:
 *                     type: object
 *                 circle2:
 *                   type: array
 *                   items:
 *                     type: object
 *                 circle3:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error while processing the action
 */
router.post('/action', async (req, res) => {
  try {
    let newHighScore = req.session.highScore;

    const { action, circle } = req.body;

    let pointChange = 0;
    let happinessChange = 0;

    for (npc of circle) {
      if (action == "compliment-button") {
        if (npc.likes_compliments == 'true') {
          pointChange += 5;
        } else if (npc.likes_compliments == 'false') {
          pointChange -= 5;
        }
      } else if (action == "invite-button") {
        if (npc.likes_invites == 'true') {
          pointChange += 5;
        } else if (npc.likes_invites == 'false') {
          pointChange -= 5;
        }
      } else {
        if (npc.likes_help == 'true') {
          pointChange += 5;
        } else if (npc.likes_help == 'false') {
          pointChange -= 5;
        }
      }
    }

    if (req.session.points + pointChange < 0) {
      req.session.points = 0;
    } else {
      req.session.points += pointChange;
      if (req.session.userId) {
        const user = await getUser(req.session.userId);
        await pool.execute(
          "UPDATE users SET total_points = ? WHERE user_id = ?",
          [user.total_points + pointChange, req.session.userId]
        );
      }
    }

    if (req.session.points > req.session.highScore) {
      if (req.session.userId) {
        await pool.execute(
          "UPDATE users SET high_score = ? WHERE user_id = ?",
          [req.session.points, req.session.userId]
        );
      }
      newHighScore = req.session.points;
      req.session.highScore = newHighScore;
    }

    happinessChange = pointChange;

    if (req.session.happiness + happinessChange > 100) {
      req.session.happiness = 100;
    } else if (req.session.happiness + happinessChange < 0) {
      req.session.happiness = 0;
    } else {
      req.session.happiness += happinessChange;
    }

    const [circle1, circle2, circle3] = await randomNpcs();
    const response = {
      currentPoints: req.session.points,
      highScore: req.session.highScore,
      happiness: req.session.happiness,
      circle1,
      circle2,
      circle3
    };
    res.status(200).send(JSON.stringify(response));
  } catch(error) {
    console.error("Error completing game action:", error);
    res.status(500).send('Error processing game action.');
  }
});

/**
 * @swagger
 * /game/update-happiness:
 *   post:
 *     summary: Update the current session's happiness
 *     description: Updates the user's session with a new happiness value.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               happiness:
 *                 type: integer
 *                 description: New happiness value to set in the session
 *                 example: 75
 *     responses:
 *       200:
 *         description: Happiness updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Happiness updated successfully
 *       500:
 *         description: Server error while updating happiness
 */
router.post('/update-happiness', async (req, res) => {
  try {
    const { happiness } = req.body;
    req.session.happiness = happiness;

    res.status(200).send("Happiness updated successfully");
  } catch(error) {
    console.error("Error updating happiness:", error);
    res.status(500).send('Error processing happiness change.');
  }
});

/**
 * @swagger
 * /game/game-over:
 *   post:
 *     summary: Handle game over and reset game state
 *     description: |
 *       Returns final session stats (points and high score), then resets points and happiness.
 *     responses:
 *       200:
 *         description: Game ended and session state reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 finalPoints:
 *                   type: integer
 *                   description: Final points before reset
 *                 finalHighScore:
 *                   type: integer
 *                   description: Final high score before reset
 *       500:
 *         description: Server error while ending game
 */
router.post('/game-over', async (req, res) => {
  try {
    const response = {
      finalPoints: req.session.points,
      finalHighScore: req.session.highScore,
    };

    req.session.happiness = 50;
    req.session.points = 0;

    res.status(200).send(JSON.stringify(response));
  } catch(error) {
    console.error("Error ending game:", error);
    res.status(500).send('Error ending game.');
  }
});

module.exports = router;
