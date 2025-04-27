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

    const charactersButton = document.getElementById("charactersButton");
    if (charactersButton) {
        charactersButton.addEventListener('click', function () {
            window.location.href = "/characters";
        });
    }
  
    const accountButton = document.getElementById("accountButton");
    if (accountButton) {
        accountButton.addEventListener('click', function () {
            window.location.href = "/accountRouter";
        });
    }

    const playersButton = document.getElementById("playersButton");
    if (playersButton) {
        playersButton.addEventListener('click', function () {
            window.location.href = "/players";
        });
    }
});
