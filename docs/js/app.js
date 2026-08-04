const newGameBtn = document.getElementById("newGameBtn");
const newGameModal = document.getElementById("newGameModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const boardSizeButtons = document.querySelectorAll(".board-size-btn");
const boardSizeSection = document.getElementById("boardSizeSection");
const difficultySection = document.getElementById("difficultySection");
const backBtn = document.getElementById("backBtn");
const difficultyButtons = document.querySelectorAll('input[name="difficulty"]');
const gameOverHomeBtn = document.getElementById("gameOverHomeBtn");
const gameOverNewBtn = document.getElementById("gameOverNewBtn");
const nextBtn = document.getElementById("nextBtn");
const gameBackBtn = document.getElementById("gameBackBtn");
const continueGameArea = document.getElementById("continueGameArea");
const continueGameBtn = document.getElementById("continueGameBtn");
const homeActions = document.querySelector(".home-actions");
const winHomeBtn =document.getElementById("winHomeBtn");
const winNewGameBtn =document.getElementById("winNewGameBtn");


let selectedDifficulty = null;
let selectedBoardSize = null;


// Open modal
newGameBtn.addEventListener("click", function () {
    // Reset selections
    selectedBoardSize = null;
    selectedDifficulty = null;
    // Uncheck old difficulty
    difficultyButtons.forEach(function (radio) {
        radio.checked = false;
    });
    // Always start modal from board-size screen
    boardSizeSection.style.display = "block";
    difficultySection.style.display = "none";
    // Open modal
    newGameModal.style.display = "flex";
});


// Close modal
closeModalBtn.addEventListener("click", function () {
    newGameModal.style.display = "none";
});

// =============================
// BOARD SIZE
// =============================

boardSizeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectedBoardSize = this.dataset.size;
        boardSizeSection.style.display = "none";
        difficultySection.style.display = "block";

    });

});

backBtn.addEventListener("click", function () {
    difficultySection.style.display = "none";
    boardSizeSection.style.display = "block";
    selectedBoardSize = null;

});


difficultyButtons.forEach(function (radio) {
    radio.addEventListener("change", function () {
        selectedDifficulty = this.value;
    });
});

nextBtn.addEventListener("click", function () {
    if (selectedDifficulty === null) {
        alert("Please select a difficulty");
        return;
    }
    newGameModal.style.display = "none";
    continueGameArea.style.display = "none";
    homeActions.style.display = "none";
    gameSection.style.display = "block";

    startGame(selectedBoardSize, selectedDifficulty);
});

// =============================
// GAME BACK / CONTINUE
// =============================

gameBackBtn.addEventListener("click", function () {

    pauseTimer();
    saveGame();
    // Hide game
    gameSection.style.display = "none";
    // Show home controls
    homeActions.style.display = "flex";
    // Show Continue button
    continueGameArea.style.display = "block";

});

continueGameBtn.addEventListener("click", function () {

    homeActions.style.display = "none";
    gameSection.style.display = "block";

    // If page was refreshed, restore saved game
    if (solutionBoard.length === 0) {
        loadSavedGame();
    }

    startTimer();
});

gameOverHomeBtn.addEventListener("click", function () {

    gameOverModal.style.display = "none";
    gameSection.style.display = "none";
    homeActions.style.display = "flex";
    // Game is finished — no Continue
    continueGameArea.style.display = "none";
    selectedCell = null;
});

gameOverNewBtn.addEventListener("click", function () {

    gameOverModal.style.display = "none";
    gameSection.style.display = "none";
    homeActions.style.display = "flex";
    continueGameArea.style.display = "none";
    selectedCell = null;
    // Open fresh New Game modal
    newGameBtn.click();
});


// ==========================================
// WIN NAVIGATION
// ==========================================

winHomeBtn.addEventListener("click", function () {

    winModal.style.display = "none";
    gameSection.style.display = "none";

    homeActions.style.display = "flex";

    // Finished game cannot be continued
    continueGameArea.style.display = "none";

    selectedCell = null;
});


winNewGameBtn.addEventListener("click", function () {

    winModal.style.display = "none";
    gameSection.style.display = "none";

    homeActions.style.display = "flex";
    continueGameArea.style.display = "none";

    selectedCell = null;

    newGameBtn.click();
});

window.addEventListener("DOMContentLoaded", function () {

    if (hasSavedGame()) {

        const savedGame = JSON.parse(
            localStorage.getItem("sudokuSavedGame")
        );

        // Show Continue
        continueGameArea.style.display = "block";

        // Show saved time
        const minutes =
            Math.floor(savedGame.elapsedSeconds / 60);

        const seconds =
            savedGame.elapsedSeconds % 60;

        pausedTime.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }
});