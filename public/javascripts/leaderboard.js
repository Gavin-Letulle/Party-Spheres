document.addEventListener("DOMContentLoaded", function () {
    const leaderboardCells = document.querySelectorAll(".leaderboard-table td");

    leaderboardCells.forEach(cell => {
        cell.addEventListener("click", function () {
            window.location.href = "/profile";
        });
    });
});