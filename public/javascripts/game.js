document.addEventListener("DOMContentLoaded", function () {
    const partyCircles = document.querySelectorAll(".party-circle");
    const gameButtons = document.querySelectorAll(".game-button");

    // Handles highlighting a circle when it is clicked ("selected") by the user
    partyCircles.forEach(circle => {
        circle.addEventListener("click", function () {
            const isSelected = circle.classList.contains("selected-circle");
            partyCircles.forEach(c => c.classList.remove("selected-circle"));
            if (!isSelected) {
                this.classList.add("selected-circle");
            }
        });
    });

    // Sends POST request to server when an action is made to update point/happiness values and randomize circles
    gameButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const selectedCircle = document.querySelector(".selected-circle");
            const circle = JSON.parse(selectedCircle.getAttribute("data-circle"));
            const action = button.id;

            const response = await fetch("/game/action", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({circle, action})
            });
            const { currentPoints, highScore, happiness, circle1, circle2, circle3 } = await response.json();

            updateHealthBar(happiness);
            document.querySelector("#current-points").innerText = `Points: ${currentPoints}`;
            document.querySelector("#high-score").innerText = `High Score: ${highScore}`;

            updateCircles(circle1, circle2, circle3);
            
            partyCircles.forEach(c => c.classList.remove("selected-circle"));
        });
    });
});

// Changes the circles (and all elements inside) on page to be the three new circles passed in
function updateCircles(circle1, circle2, circle3) {
    let circle1Elem = document.getElementById("circle1");
    let circle2Elem = document.getElementById("circle2");
    let circle3Elem = document.getElementById("circle3");
    circle1Elem.setAttribute("data-circle", JSON.stringify(circle1));
    circle2Elem.setAttribute("data-circle", JSON.stringify(circle2));
    circle3Elem.setAttribute("data-circle", JSON.stringify(circle3));

    circle1Elem.innerHTML = `<div class = "party-circle-label">Sphere 1</div>`;
    circle2Elem.innerHTML = `<div class = "party-circle-label">Sphere 2</div>`;
    circle3Elem.innerHTML = `<div class = "party-circle-label">Sphere 3</div>`;
    for (let i = 0; i < circle1.length; i++) {
        const npc = circle1[i];

        let cClass, iClass, hClass;
        if (npc.likes_compliments == 'true') {
            cClass = "like-circle-green";
        } else if (npc.likes_compliments == 'false') {
            cClass = "like-circle-red";
        } else {
            cClass = "like-circle-yellow";
        }

        if (npc.likes_help == 'true') {
            hClass = "like-circle-green";
        } else if (npc.likes_help == 'false') {
            hClass = "like-circle-red";
        } else {
            hClass = "like-circle-yellow";
        }

        if (npc.likes_invites == 'true') {
            iClass = "like-circle-green";
        } else if (npc.likes_invites == 'false') {
            iClass = "like-circle-red";
        } else {
            iClass = "like-circle-yellow";
        }

        circle1Elem.innerHTML = circle1Elem.innerHTML + 
        `<div class = "party-circle-name-img" id="circle1-npc${i}">
            <div class = "party-circle-name">
                    ${npc.npc_name}
            </div>
            <div id = "party-circle-img">
                <img src="${npc.img_path}" alt="No image">
            </div>
            <div class = "like-list-column">
                <div class = "like-circle" id = "${cClass}">C</div>
                <div class = "like-circle" id = "${iClass}">I</div>
                <div class = "like-circle" id = "${hClass}">H</div>
            </div>
        </div>`;
    }
    for (let i = 0; i < circle2.length; i++) {
        const npc = circle2[i];

        let cClass, iClass, hClass;
        if (npc.likes_compliments == 'true') {
            cClass = "like-circle-green";
        } else if (npc.likes_compliments == 'false') {
            cClass = "like-circle-red";
        } else {
            cClass = "like-circle-yellow";
        }

        if (npc.likes_help == 'true') {
            hClass = "like-circle-green";
        } else if (npc.likes_help == 'false') {
            hClass = "like-circle-red";
        } else {
            hClass = "like-circle-yellow";
        }

        if (npc.likes_invites == 'true') {
            iClass = "like-circle-green";
        } else if (npc.likes_invites == 'false') {
            iClass = "like-circle-red";
        } else {
            iClass = "like-circle-yellow";
        }

        circle2Elem.innerHTML = circle2Elem.innerHTML + 
        `<div class = "party-circle-name-img" id="circle2-npc${i}">
            <div class = "party-circle-name">
                    ${npc.npc_name}
            </div>
            <div id = "party-circle-img">
                <img src="${npc.img_path}" alt="No image">
            </div>
            <div class = "like-list-column">
                <div class = "like-circle" id = "${cClass}">C</div>
                <div class = "like-circle" id = "${iClass}">I</div>
                <div class = "like-circle" id = "${hClass}">H</div>
            </div>
        </div>`;
    }
    for (let i = 0; i < circle3.length; i++) {
        const npc = circle3[i];

        let cClass, iClass, hClass;
        if (npc.likes_compliments == 'true') {
            cClass = "like-circle-green";
        } else if (npc.likes_compliments == 'false') {
            cClass = "like-circle-red";
        } else {
            cClass = "like-circle-yellow";
        }

        if (npc.likes_help == 'true') {
            hClass = "like-circle-green";
        } else if (npc.likes_help == 'false') {
            hClass = "like-circle-red";
        } else {
            hClass = "like-circle-yellow";
        }

        if (npc.likes_invites == 'true') {
            iClass = "like-circle-green";
        } else if (npc.likes_invites == 'false') {
            iClass = "like-circle-red";
        } else {
            iClass = "like-circle-yellow";
        }

        circle3Elem.innerHTML = circle3Elem.innerHTML + 
        `<div class = "party-circle-name-img" id="circle3-npc${i}">
            <div class = "party-circle-name">
                    ${npc.npc_name}
            </div>
            <div id = "party-circle-img">
                <img src="${npc.img_path}" alt="No image">
            </div>
            <div class = "like-list-column">
                <div class = "like-circle" id = "${cClass}">C</div>
                <div class = "like-circle" id = "${iClass}">I</div>
                <div class = "like-circle" id = "${hClass}">H</div>
            </div>
        </div>`;
    }
}

// Takes in a percentage and updates the health/happiness bar to be the correct length and corresponding color
function updateHealthBar(percentage) {
    const healthBar = document.getElementById("healthBar");
    healthBar.style.setProperty("--health", percentage + "%");
    healthBar.setAttribute("data-happiness", percentage);

    if (percentage == 100) {
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

// Sets health bar to have correct look on page load
updateHealthBar(document.querySelector("#healthBar").getAttribute("data-happiness"));

// Repeats every 4 seconds to decrement happiness bar and handle game over case
setInterval(async () => {
    let happiness = document.querySelector("#healthBar").getAttribute("data-happiness");
    if (happiness - 8 >= 0) {
        happiness -= 8;
    } else {
        happiness = 0;
    }

    updateHealthBar(happiness);

    if (happiness == 0) {
        const response = await fetch("/game/game-over", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const { finalPoints, finalHighScore } = await response.json();

        document.querySelector("main").innerHTML = `
            <div class = "game-over-container">
                <div class="game-over-header">GAME OVER</div>
                <div class="game-over-text"> Oh no! Everyone got too sad and died. </div>
                <div class="game-over-text"> Score for this Round: ${finalPoints} </div>
                <div class="game-over-text"> High Score: ${finalHighScore} </div>
                <div class="game-button-row" style="margin-top: 25px">
                    <div class="game-button" onclick="location.reload()">Play Again</div>
                </div>
            </div>
        `;
        
        return;
    }

    await fetch("/game/update-happiness", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ happiness })
    });
}, 4000);
