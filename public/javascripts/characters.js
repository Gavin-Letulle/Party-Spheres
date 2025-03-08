document.addEventListener("DOMContentLoaded", function () {
    const characterContainers = document.querySelectorAll(".character-name-img");

    characterContainers.forEach(container => {
        container.addEventListener("click", function () {
            window.location.href = "/character";
        });
    });
});