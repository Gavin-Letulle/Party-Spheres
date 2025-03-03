document.addEventListener('DOMContentLoaded', function () {

    const playGameButton = document.getElementById("playGameButton");
    if (playGameButton) {
        playGameButton.addEventListener('click', function () {
        window.location.href = "/game";
      });
    }

    const leaderboardButton = document.getElementById("leaderboardButton");
    if (leaderboardButton) {
        leaderboardButton.addEventListener('click', function () {
        window.location.href = "/leaderboard";
      });
    }
  
    const accountButton = document.getElementById("accountButton");
    if (accountButton) {
        accountButton.addEventListener('click', function () {
        window.location.href = "/accountRouter";
      });
    }
  });