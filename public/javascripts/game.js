document.addEventListener("DOMContentLoaded", function () {
    const partyCircles = document.querySelectorAll(".party-circle");
    const gameButtons = document.querySelectorAll(".game-button");

    partyCircles.forEach(circle => {
        circle.addEventListener("click", function () {
            partyCircles.forEach(c => c.classList.remove("selected-circle"));
            this.classList.add("selected-circle");
        });
    });

    gameButtons.forEach(button => {
        button.addEventListener("click", function () {
            partyCircles.forEach(c => c.classList.remove("selected-circle"));
        });
    });
});