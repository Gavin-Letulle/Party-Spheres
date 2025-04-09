document.addEventListener("DOMContentLoaded", function () {
    const partyCircles = document.querySelectorAll(".party-circle");
    const gameButtons = document.querySelectorAll(".game-button");

    partyCircles.forEach(circle => {
        circle.addEventListener("click", function () {
            const isSelected = circle.classList.contains("selected-circle");
            partyCircles.forEach(c => c.classList.remove("selected-circle"));
            if (!isSelected) {
                this.classList.add("selected-circle");
            }
        });
    });

    gameButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const selectedCircle = document.querySelector(".selected-circle");
            const circle = JSON.parse(selectedCircle.getAttribute("data-circle"));
            const action = button.id;
            console.log(circle[0]);

            const response = await fetch("/game/action", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({circle, action})
            });
            const { currentPoints, highScore, circle1, circle2, circle3 } = await response.json();
            

            partyCircles.forEach(c => c.classList.remove("selected-circle"));
        });
    });
});

function updateHealthBar(percentage) {
    const healthBar = document.getElementById("healthBar");
    healthBar.style.setProperty("--health", percentage + "%");

    if (percentage === 100) {
        healthBar.classList.add("rainbow-effect");
    } else {
        healthBar.classList.remove("rainbow-effect");
        
        if (percentage >= 75) {
            healthBar.style.backgroundColor = "#73ff8f";
        } else if (percentage >= 50) {
            healthBar.style.backgroundColor = "#f8ff73";
        } else if (percentage >= 25) {
            healthBar.style.backgroundColor = "#ffc74f";
        } else {
            healthBar.style.backgroundColor = "#f57979";
        }
    }
}
updateHealthBar(50);