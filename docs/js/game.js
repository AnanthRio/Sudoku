
let mistakes = 0;
let solutionBoard = [];
let puzzleBoard = [];
let selectedCell = null;
let isPaused = false;
let isDailyChallenge = false;
let selectedDifficulty = "easy";



// =====================
// GAME ELEMENTS
// =====================

const maxMistakes = 3;
const gameSection = document.getElementById("gameSection");
const sudokuBoard = document.getElementById("sudokuBoard");
const gameMode = document.getElementById("gameMode");
const numberPad = document.getElementById("numberPad");
const eraseBtn = document.getElementById("eraseBtn");
const mistakeDisplay = document.getElementById("mistakeDisplay");
const gameOverModal = document.getElementById("gameOverModal");
const gameOverTime = document.getElementById("gameOverTime");
const winModal = document.getElementById("winModal");
const winTime = document.getElementById("winTime");
const winMistakes = document.getElementById("winMistakes");
const pauseBtn = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");
const newBestMessage = document.getElementById("newBestMessage");
const winBestTime = document.getElementById("winBestTime");
const dailyChallengeBtn = document.getElementById("dailyChallengeBtn");
const dailyStreakDisplay = document.getElementById("dailyStreakDisplay");
const NORMAL_SAVE_KEY = "sudokuNormalSavedGame";
const DAILY_SAVE_KEY = "sudokuDailySavedGame";


function createBoard(size, difficulty, daily = false) {

    size = Number(size);

    sudokuBoard.innerHTML = "";
    sudokuBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    sudokuBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    let randomFn = Math.random;

    if (daily) {
        randomFn = createSeededRandom(getDailySeed());
    }

    solutionBoard = generateSolvedBoard(size, randomFn);
    puzzleBoard = createPuzzle(solutionBoard, size, difficulty, randomFn);


    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement("div");
            cell.classList.add("sudoku-cell");
            // Save cell position
            cell.dataset.row = row;
            cell.dataset.col = col;

            let boxRows;
            let boxCols;

            if (size === 6) {
                boxRows = 2;
                boxCols = 3;
            } else {
                boxRows = 3;
                boxCols = 3;
            }

            // Thick border after each box column
            if ((col + 1) % boxCols === 0 && col !== size - 1) {
                cell.classList.add("box-border-right");
            }

            // Thick border after each box row
            if ((row + 1) % boxRows === 0 && row !== size - 1) {
                cell.classList.add("box-border-bottom");
            }

            if (puzzleBoard[row][col] !== 0) {
                cell.textContent = puzzleBoard[row][col];
                cell.classList.add("given-cell");

            } else {
                cell.textContent = "";
                cell.classList.add("empty-cell");
            }


            cell.addEventListener("click", function () {
                selectCell(this);
            });
            sudokuBoard.appendChild(cell);
        }
    }
    createNumberPad(size);
}


function startGame(size, difficulty, daily = false) {

    selectedCell = null;
    isDailyChallenge = daily;
    selectedDifficulty = difficulty;

    // Reset pause
    isPaused = false;
    sudokuBoard.classList.remove("paused");
    pauseOverlay.style.display = "none";
    numberPad.style.visibility = "visible";
    eraseBtn.style.visibility = "visible";
    pauseBtn.textContent = "⏸";

    gameMode.textContent = size + "×" + size + " • " + difficulty.toUpperCase();

    createBoard(size, difficulty, daily);

    mistakes = 0;
    updateMistakeDisplay();

    elapsedSeconds = 0;
    updateTimerDisplay();
    startTimer();
}


function updateMistakeDisplay() {
    mistakeDisplay.textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
}

function animateMistake() {

    // Restart animation even if mistakes happen quickly
    selectedCell.classList.remove("wrong-shake");
    mistakeDisplay.classList.remove("mistake-pulse");

    void selectedCell.offsetWidth;
    void mistakeDisplay.offsetWidth;

    selectedCell.classList.add("wrong-shake");
    mistakeDisplay.classList.add("mistake-pulse");

    setTimeout(function () {
        selectedCell.classList.remove("wrong-shake");
        mistakeDisplay.classList.remove("mistake-pulse");
    }, 400);
}


function createNumberPad(size) {
    numberPad.innerHTML = "";
    for (let number = 1; number <= size; number++) {
        const button = document.createElement("button");
        button.classList.add("number-btn");
        button.textContent = number;
        button.dataset.number = number;
        button.addEventListener("click", function () {
            enterNumber(number);
        });
        numberPad.appendChild(button);
    }
}

function updateCompletedNumbers() {

    const size = solutionBoard.length;

    for (let number = 1; number <= size; number++) {
        let correctCount = 0;
        const cells = document.querySelectorAll(".sudoku-cell");

        cells.forEach(function (cell) {

            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);

            if (
                Number(cell.textContent) === number &&
                solutionBoard[row][col] === number
            ) {
                correctCount++;
            }
        });

        const button = document.querySelector(`.number-btn[data-number="${number}"]`);

        if (correctCount === size) {
            button.classList.add("completed-number");
            button.disabled = true;
        } else {
            button.classList.remove("completed-number");
            button.disabled = false;
        }
    }
}


function checkCompletedSections(row, col) {
    const size = solutionBoard.length;

    // -------------------------
    // CHECK ROW
    // -------------------------
    let rowComplete = true;

    for (let c = 0; c < size; c++) {
        const cell = document.querySelector(
            `.sudoku-cell[data-row="${row}"][data-col="${c}"]`
        );

        if (Number(cell.textContent) !== solutionBoard[row][c]) {
            rowComplete = false;
            break;
        }
    }

    if (rowComplete) {
        animateWave(
            Array.from(
                document.querySelectorAll(
                    `.sudoku-cell[data-row="${row}"]`
                )
            )
        );
    }


    // -------------------------
    // CHECK COLUMN
    // -------------------------
    let colComplete = true;

    for (let r = 0; r < size; r++) {
        const cell = document.querySelector(
            `.sudoku-cell[data-row="${r}"][data-col="${col}"]`
        );

        if (Number(cell.textContent) !== solutionBoard[r][col]) {
            colComplete = false;
            break;
        }
    }

    if (colComplete) {
        const columnCells = [];
        for (let r = 0; r < size; r++) {
            columnCells.push(
                document.querySelector(
                    `.sudoku-cell[data-row="${r}"][data-col="${col}"]`
                )
            );
        }
        animateWave(columnCells);
    }

    // -----------------------
    // Check Box
    // -----------------------

    let boxRows;
    let boxCols;

    if (size === 6) {
        boxRows = 2;
        boxCols = 3;
    } else {
        boxRows = 3;
        boxCols = 3;
    }

    const startRow = Math.floor(row / boxRows) * boxRows;
    const startCol = Math.floor(col / boxCols) * boxCols;

    const boxCells = [];
    let boxComplete = true;

    for (let r = startRow; r < startRow + boxRows; r++) {
        for (let c = startCol; c < startCol + boxCols; c++) {

            const cell = document.querySelector(
                `.sudoku-cell[data-row="${r}"][data-col="${c}"]`
            );

            boxCells.push(cell);

            if (Number(cell.textContent) !== solutionBoard[r][c]) {
                boxComplete = false;
            }
        }
    }

    if (boxComplete) {
        animateWave(boxCells);
    }
}

function animateWave(cells) {

    cells.forEach(function (cell, index) {
        setTimeout(function () {
            cell.classList.add("completion-wave");

            setTimeout(function () {
                cell.classList.remove("completion-wave");
            }, 350);

        }, index * 60);

    });
}


function enterNumber(number) {

    // Game already over
    if (mistakes >= maxMistakes) {
        return;
    }


    // Player hasn't selected a cell
    if (selectedCell === null) {
        return;
    }

    // Don't allow editing given cells
    // or correctly completed cells
    if (
        selectedCell.classList.contains("given-cell") ||
        selectedCell.classList.contains("correct-cell")
    ) {
        return;
    }

    const row = Number(selectedCell.dataset.row);
    const col = Number(selectedCell.dataset.col);

    // Show entered number
    selectedCell.textContent = number;
    document.querySelectorAll(".related-cell")
        .forEach(function (cell) {
            cell.classList.remove("related-cell");
        });


    highlightSameNumbers(number);

    // Remove previous result color
    selectedCell.classList.remove(
        "correct-cell",
        "wrong-cell"
    );

    // Compare against hidden solution
    if (number === solutionBoard[row][col]) {

        // Correct answer
        selectedCell.classList.add("correct-cell");

        // Check if row / column / box was completed
        checkCompletedSections(row, col);

        // Check whether this was the final answer
        if (checkGameComplete()) {
            gameWon();
        }

    } else {

        // Wrong answer
        selectedCell.classList.add("wrong-cell");

        mistakes++;
        updateMistakeDisplay();

        // Shake cell + pulse mistake counter
        animateMistake();

        // Maximum mistakes reached
        if (mistakes >= maxMistakes) {
            gameOver();
            return;
        }
    }

    // Fade/disable numbers that are fully completed
    updateCompletedNumbers();

    // Save current game state
    saveGame();
}


function saveGame() {

    const size = solutionBoard.length;
    // No active game
    if (size === 0) {
        return;
    }

    const playerAnswers = [];

    for (let row = 0; row < size; row++) {
        playerAnswers[row] = [];
        for (let col = 0; col < size; col++) {
            const cell = document.querySelector(
                `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
            );

            if (cell.classList.contains("given-cell")) {
                playerAnswers[row][col] = null;
            } else {
                playerAnswers[row][col] =
                    cell.textContent === ""
                        ? 0
                        : Number(cell.textContent);
            }
        }
    }

    const gameData = {
        size: size,
        difficulty: selectedDifficulty,
        solutionBoard: solutionBoard,
        puzzleBoard: puzzleBoard,
        playerAnswers: playerAnswers,
        mistakes: mistakes,
        elapsedSeconds: elapsedSeconds
    };

    const saveKey = isDailyChallenge
        ? DAILY_SAVE_KEY
        : NORMAL_SAVE_KEY;

    localStorage.setItem(
        saveKey,
        JSON.stringify(gameData)
    );
}

function savePersonalBest() {

    const size = solutionBoard.length;
    const key = `${size}x${size}-${selectedDifficulty}`;

    const bestTimes =
        JSON.parse(
            localStorage.getItem("sudokuBestTimes")
        ) || {};

    const oldBest = bestTimes[key];

    if (
        oldBest === undefined ||
        elapsedSeconds < oldBest
    ) {
        bestTimes[key] = elapsedSeconds;

        localStorage.setItem(
            "sudokuBestTimes",
            JSON.stringify(bestTimes)
        );
        return true;
    }
    return false;
}

function getPersonalBest() {

    const size = solutionBoard.length;
    const key = `${size}x${size}-${selectedDifficulty}`;

    const bestTimes =
        JSON.parse(
            localStorage.getItem("sudokuBestTimes")
        ) || {};

    return bestTimes[key];
}

function getStats() {

    return JSON.parse(
        localStorage.getItem("sudokuStats")
    ) || {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0
    };
}

function saveStats(stats) {

    localStorage.setItem(
        "sudokuStats",
        JSON.stringify(stats)
    );
}

function recordWin() {

    const stats = getStats();

    stats.gamesPlayed++;
    stats.gamesWon++;
    stats.currentStreak++;

    if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
    }

    saveStats(stats);
}

function recordLoss() {

    const stats = getStats();
    stats.gamesPlayed++;
    stats.currentStreak = 0;

    saveStats(stats);
}

// ============================
// DAILY CHALLENGE
// ============================

function getTodayDateKey() {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function markDailyChallengeCompleted() {

    const todayKey = getTodayDateKey();

    localStorage.setItem("sudokuDailyCompleted", todayKey);
}

function markDailyChallengeFailed() {

    const todayKey = getTodayDateKey();

    localStorage.setItem("sudokuDailyFailed", todayKey);
}

function isDailyChallengeFailedToday() {

    const savedDate = localStorage.getItem("sudokuDailyFailed");

    return savedDate === getTodayDateKey();
}

function resetDailyStreak() {

    const stats = getDailyStats();
    stats.currentStreak = 0;
    saveDailyStats(stats);
}


function isDailyChallengeCompletedToday() {

    const savedDate = localStorage.getItem("sudokuDailyCompleted");
    return savedDate === getTodayDateKey();
}

function updateDailyChallengeButton() {

    if (isDailyChallengeCompletedToday()) {
        dailyChallengeBtn.textContent = "✅ Completed Today";
        dailyChallengeBtn.classList.add("daily-completed");
        dailyChallengeBtn.disabled = true;

    } else if (isDailyChallengeFailedToday()) {
        dailyChallengeBtn.textContent = "❌ Failed Today";
        dailyChallengeBtn.classList.add("daily-completed");
        dailyChallengeBtn.disabled = true;
    } else {
        dailyChallengeBtn.textContent = "📅 Daily Challenge";
        dailyChallengeBtn.classList.remove("daily-completed");
        dailyChallengeBtn.disabled = false;
    }
}

function updateDailyStreakDisplay() {

    const stats = getDailyStats();

    dailyStreakDisplay.textContent = `🔥 ${stats.currentStreak}`;
}

function getDailyStats() {

    return JSON.parse(
        localStorage.getItem("sudokuDailyStats")
    ) || {
        currentStreak: 0,
        bestStreak: 0,
        lastCompleted: null
    };
}


function saveDailyStats(stats) {

    localStorage.setItem("sudokuDailyStats", JSON.stringify(stats));
}


function getYesterdayDateKey() {

    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function updateDailyStreak() {

    const stats = getDailyStats();
    const today = getTodayDateKey();
    const yesterday = getYesterdayDateKey();

    // Already completed today
    if (stats.lastCompleted === today) {
        return;
    }

    // Completed yesterday → continue streak
    if (stats.lastCompleted === yesterday) {
        stats.currentStreak++;
    } else {
        // Missed a day or this is the first challenge
        stats.currentStreak = 1;
    }

    // Update best streak
    if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
    }

    stats.lastCompleted = today;

    saveDailyStats(stats);
}


// ============================
// PAUSE / RESUME
// ============================

pauseBtn.addEventListener("click", function () {
    if (!isPaused) {
        // pause
        pauseTimer();

        isPaused = true;
        saveGame();

        sudokuBoard.classList.add("paused");
        pauseOverlay.style.display = "flex";
        numberPad.style.visibility = "hidden";
        eraseBtn.style.visibility = "hidden";
        pauseBtn.textContent = "▶";

    } else {

        // Resume
        startTimer();
        isPaused = false;

        sudokuBoard.classList.remove("paused");
        pauseOverlay.style.display = "none";
        numberPad.style.visibility = "visible";
        eraseBtn.style.visibility = "visible";
        pauseBtn.textContent = "⏸";
    }
});

window.addEventListener("beforeunload", function () {

    if (solutionBoard.length > 0) {
        saveGame();
    }

});


function checkGameComplete() {

    const emptyCells = document.querySelectorAll(".empty-cell");

    for (let cell of emptyCells) {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const enteredNumber = Number(cell.textContent);

        // One cell is empty or wrong
        if (enteredNumber !== solutionBoard[row][col]) {
            return false;
        }
    }
    return true;
}

function highlightSameNumbers(number) {

    // Remove previous highlights
    document.querySelectorAll(".same-number-cell")
        .forEach(function (cell) {
            cell.classList.remove("same-number-cell");
        });

    // Nothing to highlight
    if (!number) {
        return;
    }

    const cells = document.querySelectorAll(".sudoku-cell");

    cells.forEach(function (cell) {

        if (cell.textContent === String(number)) {
            cell.classList.add("same-number-cell");
        }

    });
}

function gameWon() {

    pauseTimer();

    const isNewBest = savePersonalBest();

    recordWin();
    if (isDailyChallenge) {
        markDailyChallengeCompleted();
        updateDailyStreak();
        updateDailyChallengeButton();
        updateDailyStreakDisplay();

        document.getElementById("dailyWinStreak").textContent = `🔥 Streak: ${getDailyStats().currentStreak}`;
    }
    const bestTime = getPersonalBest();

    if (isDailyChallenge) {
        localStorage.removeItem(DAILY_SAVE_KEY);
    } else {
        localStorage.removeItem(NORMAL_SAVE_KEY);
    }
    winTime.textContent = gameTimer.textContent;
    winMistakes.textContent = `${mistakes}/${maxMistakes}`;

    const bestMinutes = Math.floor(bestTime / 60);
    const bestSeconds = bestTime % 60;

    winBestTime.textContent =
        String(bestMinutes).padStart(2, "0") +
        ":" +
        String(bestSeconds).padStart(2, "0");

    if (isNewBest) {
        newBestMessage.style.display = "block";
        // Special gold celebration for personal best
        launchBestConfetti();
    } else {
        newBestMessage.style.display = "none";
        // Normal celebration
        launchConfetti();
    }

    if (isDailyChallenge) {
        winModal.querySelector("h2").textContent = "🎉 Daily Challenge Complete!";
    } else {
        winModal.querySelector("h2").textContent = "🎉 Puzzle Complete!";
    }

    document.getElementById("dailyWinStreak").style.display = isDailyChallenge ? "block" : "none";

    winModal.style.display = "flex";
}

function launchConfetti() {

    const colors = [
        "#ff4757",
        "#ffa502",
        "#2ed573",
        "#1e90ff",
        "#a55eea",
        "#ff6b81"
    ];

    for (let i = 0; i < 100; i++) {

        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        // Random horizontal position
        confetti.style.left = Math.random() * 100 + "vw";

        // Random color
        confetti.style.backgroundColor =
            colors[
            Math.floor(Math.random() * colors.length)
            ];

        // Slightly different falling speeds
        confetti.style.animationDuration = (2 + Math.random() * 2) + "s";

        // Don't make everything start together
        confetti.style.animationDelay = (Math.random() * 0.7) + "s";

        // Random size
        const size = 6 + Math.random() * 7;
        confetti.style.width = size + "px";
        confetti.style.height = size * 1.5 + "px";
        document.body.appendChild(confetti);

        // Clean it up afterwards
        setTimeout(function () {
            confetti.remove();
        }, 5000);
    }
}


function launchBestConfetti() {

    const colors = [
        "#FFD700", // gold
        "#FFC107", // amber
        "#FFEB3B", // yellow
        "#FFF3B0", // light gold
        "#FFFFFF"  // white sparkle
    ];

    // More confetti than a normal win
    for (let i = 0; i < 160; i++) {

        const confetti = document.createElement("div");

        confetti.classList.add("confetti");

        // Random horizontal position
        confetti.style.left = Math.random() * 100 + "vw";

        // Gold-family random color
        confetti.style.backgroundColor =
            colors[
            Math.floor(Math.random() * colors.length)
            ];

        // Different falling speeds
        confetti.style.animationDuration = (2 + Math.random() * 2) + "s";

        // Don't start everything together
        confetti.style.animationDelay = (Math.random() * 0.7) + "s";

        // Random size
        const size = 7 + Math.random() * 8;

        confetti.style.width = size + "px";
        confetti.style.height = size * 1.5 + "px";

        document.body.appendChild(confetti);

        // Remove afterwards
        setTimeout(function () {
            confetti.remove();
        }, 5000);
    }
}


function gameOver() {

    pauseTimer();
    recordLoss();

    if (isDailyChallenge) {
        markDailyChallengeFailed();
        resetDailyStreak();
        updateDailyChallengeButton();
        updateDailyStreakDisplay();
        localStorage.removeItem(DAILY_SAVE_KEY);

        document.getElementById("gameOverTitle").textContent = "❌ Daily Challenge Failed";
        document.getElementById("gameOverMessage").textContent = "You made 3 mistakes. Come back tomorrow!";
        document.getElementById("dailyGameOverStreak").textContent = `🔥 Streak: ${getDailyStats().currentStreak}`;
        document.getElementById("dailyGameOverStreak").style.display = "block";
    } else {
        localStorage.removeItem(NORMAL_SAVE_KEY);
        document.getElementById("gameOverTitle").textContent = "Game Over";
        document.getElementById("gameOverMessage").textContent = "You made 3 mistakes.";
        document.getElementById("dailyGameOverStreak").style.display = "none";
    }

    // Show final time
    gameOverTime.textContent = gameTimer.textContent;

    // Show modal
    gameOverModal.style.display = "flex";
}


function eraseSelectedCell() {
    if (selectedCell === null) {
        return;
    }
    if (
        selectedCell.classList.contains("given-cell") ||
        selectedCell.classList.contains("correct-cell")
    ) {
        return;
    }
    selectedCell.textContent = "";
    highlightSameNumbers(null);
    selectedCell.classList.remove("correct-cell", "wrong-cell");
    saveGame();
}

function hasSavedGame() {
    return localStorage.getItem(NORMAL_SAVE_KEY) !== null;
}

eraseBtn.addEventListener("click", function () {
    eraseSelectedCell();
});

document.addEventListener("keydown", function (event) {
    // No active selected cell

    if (isPaused) {
        return;
    }

    if (selectedCell === null) {
        return;
    }
    const key = event.key;

    // Number keys
    if (key >= "1" && key <= "9") {
        const number = Number(key);
        // Find current board size
        const size = solutionBoard.length;
        // Prevent 7,8,9 on a 6×6 board
        if (number <= size) {
            enterNumber(number);
        }
        return;
    }

    if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        eraseSelectedCell();
        return;
    }

    if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight"
    ) {

        event.preventDefault();
        moveSelectedCell(key);
    }
});


function selectCell(cell) {

    // Remove old selected cell
    if (selectedCell !== null) {
        selectedCell.classList.remove("selected-cell");
    }

    selectedCell = cell;
    selectedCell.classList.add("selected-cell");

    const row = Number(selectedCell.dataset.row);
    const col = Number(selectedCell.dataset.col);
    const number = selectedCell.textContent;

    // Clear previous related-cell highlights
    document.querySelectorAll(".related-cell")
        .forEach(function (cell) {
            cell.classList.remove("related-cell");
        });

    // Clear previous same-number highlights
    document.querySelectorAll(".same-number-cell")
        .forEach(function (cell) {
            cell.classList.remove("same-number-cell");
        });

    if (number === "") {

        // EMPTY CELL
        // Highlight row + column + box
        highlightRelatedCells(row, col);

    } else {

        // CELL WITH NUMBER
        // Highlight only matching numbers
        highlightSameNumbers(number);
    }
}
function loadSavedGame() {

    const savedData = localStorage.getItem(NORMAL_SAVE_KEY);

    if (savedData === null) {
        return;
    }

    const savedGame = JSON.parse(savedData);

    // Restore game state
    solutionBoard = savedGame.solutionBoard;
    puzzleBoard = savedGame.puzzleBoard;
    mistakes = Math.min(
        Number(savedGame.mistakes) || 0,
        maxMistakes
    );
    elapsedSeconds = savedGame.elapsedSeconds;
    selectedDifficulty = savedGame.difficulty;
    selectedCell = null;

    const size = savedGame.size;

    // Update game information
    gameMode.textContent =
        size + "×" + size + " • " +
        savedGame.difficulty.toUpperCase();

    updateMistakeDisplay();
    updateTimerDisplay();

    // Rebuild board using SAVED puzzle
    restoreBoard(size, savedGame.playerAnswers);

    createNumberPad(size);
    updateCompletedNumbers();
}

function loadDailySavedGame() {

    const savedData = localStorage.getItem(DAILY_SAVE_KEY);

    if (savedData === null) {
        return false;
    }

    const savedGame = JSON.parse(savedData);

    solutionBoard = savedGame.solutionBoard;
    puzzleBoard = savedGame.puzzleBoard;
    mistakes = Math.min(
        Number(savedGame.mistakes) || 0,
        maxMistakes
    );
    elapsedSeconds = savedGame.elapsedSeconds;
    selectedDifficulty = savedGame.difficulty;
    selectedCell = null;
    isDailyChallenge = true;

    const size = savedGame.size;

    gameMode.textContent =
        size + "×" + size + " • " +
        savedGame.difficulty.toUpperCase();

    updateMistakeDisplay();
    updateTimerDisplay();

    restoreBoard(size, savedGame.playerAnswers);

    createNumberPad(size);
    updateCompletedNumbers();

    return true;
}

function restoreBoard(size, playerAnswers) {

    sudokuBoard.innerHTML = "";
    sudokuBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    sudokuBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {

            const cell = document.createElement("div");

            cell.classList.add("sudoku-cell");

            cell.dataset.row = row;
            cell.dataset.col = col;

            // -------------------
            // BOX BORDERS
            // -------------------
            let boxRows;
            let boxCols;

            if (size === 6) {
                boxRows = 2;
                boxCols = 3;
            } else {
                boxRows = 3;
                boxCols = 3;
            }

            if (
                (col + 1) % boxCols === 0 &&
                col !== size - 1
            ) {
                cell.classList.add("box-border-right");
            }

            if (
                (row + 1) % boxRows === 0 &&
                row !== size - 1
            ) {
                cell.classList.add("box-border-bottom");
            }

            // ------------------
            // GIVEN CELL
            // ------------------

            if (puzzleBoard[row][col] !== 0) {
                cell.textContent = puzzleBoard[row][col];
                cell.classList.add("given-cell");

            } else {

                // ----------------
                // PLAYER CELL
                // ----------------

                cell.classList.add("empty-cell");

                const answer = playerAnswers[row][col];

                if (answer !== 0) {
                    cell.textContent = answer;
                    if (
                        answer ===
                        solutionBoard[row][col]
                    ) {
                        cell.classList.add(
                            "correct-cell"
                        );
                    } else {
                        cell.classList.add(
                            "wrong-cell"
                        );
                    }

                } else {
                    cell.textContent = "";
                }

                cell.addEventListener("click", function () {
                    selectCell(this);
                });
            }
            sudokuBoard.appendChild(cell);
        }
    }
}

function highlightRelatedCells(selectedRow, selectedCol) {

    const size = solutionBoard.length;
    const cells = document.querySelectorAll(".sudoku-cell");

    // Remove previous highlights
    cells.forEach(function (cell) {
        cell.classList.remove("related-cell");
    });

    let boxRows;
    let boxCols;

    if (size === 6) {
        boxRows = 2;
        boxCols = 3;
    } else {
        boxRows = 3;
        boxCols = 3;
    }

    const selectedBoxRow = Math.floor(selectedRow / boxRows);
    const selectedBoxCol = Math.floor(selectedCol / boxCols);

    cells.forEach(function (cell) {

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const sameRow = row === selectedRow;
        const sameColumn = col === selectedCol;

        const sameBox =
            Math.floor(row / boxRows) === selectedBoxRow &&
            Math.floor(col / boxCols) === selectedBoxCol;

        if (sameRow || sameColumn || sameBox) {
            cell.classList.add("related-cell");
        }
    });
}


function moveSelectedCell(direction) {

    if (selectedCell === null) {
        return;
    }

    const size = solutionBoard.length;
    let row = Number(selectedCell.dataset.row);
    let col = Number(selectedCell.dataset.col);

    switch (direction) {
        case "ArrowUp":
            row--;
            break;
        case "ArrowDown":
            row++;
            break;
        case "ArrowLeft":
            col--;
            break;
        case "ArrowRight":
            col++;
            break;
    }

    // Don't move outside board
    if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size
    ) {
        return;
    }

    const nextCell = document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );

    selectCell(nextCell);
}

dailyChallengeBtn.addEventListener("click", function () {

    if (
        isDailyChallengeCompletedToday() ||
        isDailyChallengeFailedToday()
    ) {
        return;
    }

    continueGameArea.style.display = "none";
    homeActions.style.display = "none";
    gameSection.style.display = "block";

    if (!loadDailySavedGame()) {
        startGame(9, "hard", true);
    } else {
        startTimer();
    }

});

continueGameBtn.addEventListener("click", function () {

    continueGameArea.style.display = "none";
    homeActions.style.display = "none";
    gameSection.style.display = "block";

    loadSavedGame();

    isDailyChallenge = false;

    startTimer();
});

updateDailyChallengeButton();
updateDailyStreakDisplay();