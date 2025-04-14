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

async function getUser(userId) {
  const [users] = await pool.execute(
    "SELECT total_points, high_score FROM users WHERE user_id = ?", 
    [userId]
  );
  return users[0];
}

router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      if (!req.session.points && !req.session.happiness) {
        req.session.points = 0;
        req.session.happiness = 50;
      }

      if (!req.session.highScore) {
        req.session.highScore = 0;
      }

      console.log(req.session.highScore);
      const [circle1, circle2, circle3] = await randomNpcs();

      res.render(
        'game', { 
          title: 'Game page',
          highScore: req.session.highScore,
          points: req.session.points,
          happiness: req.session.happiness,
          circle1,
          circle2,
          circle3
      });
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
    let newHighScore = req.session.highScore;

    const { action, circle } = req.body;

    let pointChange = 0;
    let happinessChange = 0;

    for (npc of circle) {
      if (action == "compliment-button") {
        if (npc.likes_compliments == 'true') {
          pointChange += 7;
        } else if (npc.likes_compliments == 'false') {
          pointChange -= 7;
        }
      } else if (action == "invite-button") {
        if (npc.likes_invites == 'true') {
          pointChange += 7;
        } else if (npc.likes_invites == 'false') {
          pointChange -= 7;
        }
      } else {
        if (npc.likes_help == 'true') {
          pointChange += 7;
        } else if (npc.likes_help == 'false') {
          pointChange -= 7;
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


router.post('/game-over', async (req, res) => {
  try {
    req.session.happiness = 50;
    req.session.points = 0;

    res.status(200).send("Game ended successfully");
  } catch(error) {
    console.error("Error ending game:", error);
    res.status(500).send('Error ending game.');
  }
});

module.exports = router;