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
const winHomeBtn = document.getElementById("winHomeBtn");
const winNewGameBtn = document.getElementById("winNewGameBtn");
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("sudokuTheme");
const colorThemeBtn = document.getElementById("colorThemeBtn");
const themeMenu = document.getElementById("themeMenu");
const themeOptions = document.querySelectorAll(".theme-option");
const statsBtn = document.getElementById("statsBtn");
const statsModal = document.getElementById("statsModal");
const closeStatsBtn = document.getElementById("closeStatsBtn");
const statGamesPlayed = document.getElementById("statGamesPlayed");
const statGamesWon = document.getElementById("statGamesWon");
const statWinRate = document.getElementById("statWinRate");
const statBestStreak = document.getElementById("statBestStreak");

let modalSelectedDifficulty = null;
let selectedBoardSize = null;

// Open modal
newGameBtn.addEventListener("click", function () {
    // Reset selections
    selectedBoardSize = null;
    modalSelectedDifficulty = null;
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

// ===================
// BOARD SIZE
// ===================

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
        modalSelectedDifficulty = this.value;
    });
});

nextBtn.addEventListener("click", function () {
    if (modalSelectedDifficulty === null) {
        alert("Please select a difficulty");
        return;
    }
    newGameModal.style.display = "none";
    continueGameArea.style.display = "none";
    homeActions.style.display = "none";
    gameSection.style.display = "block";

    startGame(selectedBoardSize, modalSelectedDifficulty);
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


// =======================
// WIN NAVIGATION
// =======================

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

    const savedColorTheme = localStorage.getItem("sudokuColorTheme");

    if (
        savedColorTheme &&
        savedColorTheme !== "default"
    ) {
        document.body.setAttribute(
            "data-theme",
            savedColorTheme
        );
    }

    if (hasSavedGame()) {

        const savedGame = JSON.parse(localStorage.getItem("sudokuSavedGame"));

        // Show Continue
        continueGameArea.style.display = "block";

        // Show saved time
        const minutes = Math.floor(savedGame.elapsedSeconds / 60);
        const seconds = savedGame.elapsedSeconds % 60;

        pausedTime.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }
});

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️";
        localStorage.setItem("sudokuTheme", "dark");
    } else {
        themeToggle.textContent = "🌙";
        localStorage.setItem("sudokuTheme", "light");
    }
});


if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}

colorThemeBtn.addEventListener("click", function () {
    if (themeMenu.style.display === "block") {
        themeMenu.style.display = "none";
    } else {
        themeMenu.style.display = "block";
    }
});

themeOptions.forEach(function (button) {
    button.addEventListener("click", function () {

        const theme = this.dataset.theme;
        if (theme === "default") {
            document.body.removeAttribute("data-theme");
            localStorage.setItem("sudokuColorTheme", "default");

        } else {
            document.body.setAttribute("data-theme", theme);
            localStorage.setItem("sudokuColorTheme", theme);
        }
        themeMenu.style.display = "none";
    });

});

statsBtn.addEventListener("click", function () {
    updateStatsDisplay();
    statsModal.style.display = "flex";
});

closeStatsBtn.addEventListener("click", function () {
    statsModal.style.display = "none";
});

statsModal.addEventListener("click", function (event) {

    if (event.target === statsModal) {
        statsModal.style.display = "none";
    }

});

function formatBestTime(seconds) {

    if (seconds === undefined) {
        return "--:--";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


function updateStatsDisplay() {

    const stats = getStats();

    const bestTimes =
        JSON.parse(
            localStorage.getItem("sudokuBestTimes")
        ) || {};

    // General stats
    statGamesPlayed.textContent = stats.gamesPlayed;
    statGamesWon.textContent = stats.gamesWon;
    statBestStreak.textContent = stats.bestStreak;

    const dailyStats = getDailyStats();

    statDailyStreak.textContent =
        dailyStats.currentStreak;

    statBestDailyStreak.textContent =
        dailyStats.bestStreak;

    // Win rate
    let winRate = 0;

    if (stats.gamesPlayed > 0) {
        winRate = Math.round(
            (stats.gamesWon / stats.gamesPlayed) * 100
        );
    }

    statWinRate.textContent = winRate + "%";


    // 6×6 Personal Bests
    document.getElementById("best6Easy").textContent = formatBestTime(bestTimes["6x6-easy"]);
    document.getElementById("best6Medium").textContent = formatBestTime(bestTimes["6x6-medium"]);
    document.getElementById("best6Hard").textContent = formatBestTime(bestTimes["6x6-hard"]);
    document.getElementById("best6Expert").textContent = formatBestTime(bestTimes["6x6-expert"]);


    // 9×9 Personal Bests
    document.getElementById("best9Easy").textContent = formatBestTime(bestTimes["9x9-easy"]);
    document.getElementById("best9Medium").textContent = formatBestTime(bestTimes["9x9-medium"]);
    document.getElementById("best9Hard").textContent = formatBestTime(bestTimes["9x9-hard"]);
    document.getElementById("best9Expert").textContent = formatBestTime(bestTimes["9x9-expert"]);
}