var express = require('express');
var router = express.Router();
const pool = require('../database/connection');  

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

router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login'); 
    //  return res.status(401).send('Unauthorized: Please log in.');
    } else {
      const [users] = await pool.execute(
          "SELECT total_points, high_score FROM users WHERE user_id = ?", 
          [req.session.userId]
      );
      const user = users[0];

      const [circle1, circle2, circle3] = await randomNpcs();

      req.session.points = 0;
      req.session.happiness = 50;

      res.render(
        'game', { 
          title: 'Game page',
          user,
          points: req.session.points,
          happiness: req.session.happiness,
          circle1,
          circle2,
          circle3
      });
    }
  } catch(error) {
    console.error("Error fetching game data:", error);
    res.status(500).send('Error loading game state.');
  }
});

router.post('/action', async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT total_points, high_score FROM users WHERE user_id = ?", 
      [req.session.userId]
    );
    const user = users[0];

    const { action, circle } = req.body;

    let pointChange = 0;

    for (npc of circle) {
      console.log(npc);
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
    }

    if (req.session.happiness + pointChange > 100) {
      req.session.happiness = 100;
    } else if (req.session.happiness + pointChange < 0) {
      req.session.happiness = 0;
    } else {
      req.session.happiness += pointChange;
    }

    console.log(req.session.points);

    const [circle1, circle2, circle3] = await randomNpcs();
    const response = {
      currentPoints: req.session.points,
      highScore: 2,
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

module.exports = router;