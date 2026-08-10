<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sudoku</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>

    <!-- Main Page -->
    <main class="home-container">
        <div class="home-header">
            <h1 class="game-title">SUDOKU</h1>

            <p class="game-tagline">
                Keep your mind sharp ✏️
            </p>
        </div>

        <div id="dailyStreakDisplay" class="daily-streak-display">
            🔥 0 Day Streak
        </div>
        
        <button id="themeToggle" class="theme-toggle">
            🌙
        </button>

        <button id="colorThemeBtn" class="color-theme-btn">
            🎨
        </button>

        <div id="themeMenu" class="theme-menu">

            <button class="theme-option" data-theme="default">
                ⚪ Default
            </button>

            <button class="theme-option" data-theme="blue">
                🔵 Blue
            </button>

            <button class="theme-option" data-theme="green">
                🟢 Green
            </button>

            <button class="theme-option" data-theme="purple">
                🟣 Purple
            </button>

            <button class="theme-option" data-theme="orange">
                🟠 Orange
            </button>

        </div>

        <div class="home-actions">

            <div id="continueGameArea" class="continue-game-area">

                <button id="continueGameBtn" class="continue-game-btn">
                    <span>Continue</span>
                    <small id="pausedTime">00:00</small>
                </button>

            </div>

            <button id="newGameBtn" class="new-game-btn">
                New Game
            </button>

            <button id="dailyChallengeBtn" class="daily-challenge-btn">
                📅 Daily Challenge
            </button>

            <button id="statsBtn" class="stats-btn">
                📊 Statistics
            </button>

        </div>

        <!-- Game -->
        <section id="gameSection" class="game-section">

            <button id="gameBackBtn" class="game-back-btn">
                ← Back
            </button>

            <div class="game-info">
                <span id="gameMode"></span>
                <span id="mistakeDisplay">Mistakes: 0/3</span>
                <span id="gameTimer">00:00</span>
                <button id="pauseBtn" class="pause-btn">⏸</button>
            </div>

            <div class="game-arena">
                <div id="sudokuBoard" class="sudoku-board">
                    <!-- JavaScript creates cells -->

                    <div id="pauseOverlay" class="pause-overlay">
                        <span>⏸ Paused</span>
                    </div>
                </div>

                <div id="numberPad" class="number-pad">
                    <!-- JavaScript creates number buttons -->
                </div>


                <div class="game-tools">
                    <button id="eraseBtn" class="erase-btn">
                        ⌫ Erase
                    </button>
                </div>
            </div>

            <aside class="how-to-play">
                <h3>How to Play</h3>
                <p id="ruleIntro">
                    Fill every empty cell using numbers 1–6.
                </p>

                <ul>
                    <li>No repeated numbers in a row.</li>
                    <li>No repeated numbers in a column.</li>
                    <li id="boxRule">No repeated numbers in each 2×3 box and 3×3 box.</li>
                    <li>You can make up to 3 mistakes.</li>
                </ul>

                <div class="game-tip">
                    <strong>💡 Tip</strong>
                    <p>
                        Look for a row, column, or box where only one number is missing.
                    </p>
                </div>
            </aside>
        </section>

    </main>

    <!-- Game Modal -->
    <div id="newGameModal" class="modal">
        <div class="modal-content">

            <button id="closeModalBtn" class="close-btn">
                &times;
            </button>

            <!-- Board Size Selection -->
            <div id="boardSizeSection">
                <h2>New Game</h2>
                <p>Choose</p>
                <div class="board-options">

                    <button class="board-size-btn" data-size="6">
                        <span>6 × 6</span>
                        <small>Fast</small>
                    </button>

                    <button class="board-size-btn" data-size="9">
                        <span>9 × 9</span>
                        <small>Classic</small>
                    </button>

                </div>
            </div>


            <!-- Difficulty Selection -->
            <div id="difficultySection" class="difficulty-section">
                <h2>Choose Difficulty</h2>
                <div class="difficulty-options">
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="easy">
                        <span>Easy</span>
                    </label>

                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="medium">
                        <span>Medium</span>
                    </label>

                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="hard">
                        <span>Hard</span>
                    </label>

                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="expert">
                        <span>Expert</span>
                    </label>
                </div>

                <div class="difficulty-footer">
                    <button id="backBtn" class="back-btn">
                        Back
                    </button>

                    <button id="nextBtn" class="next-btn">
                        Next
                    </button>

                </div>
            </div>
        </div>
    </div>


    <!-- Win Modal -->
    <div id="winModal" class="modal">
        <div class="modal-content win-content">
            <h2>🎉 Puzzle Complete!</h2>
            <p>Great job! You solved the puzzle.</p>
            <p id="newBestMessage" class="new-best-message">
                🏆 New Personal Best!
            </p>
            <div class="win-stats">
                <div>
                    <span>Time</span>
                    <strong id="winTime">00:00</strong>
                </div>

                <div>
                    <span>Mistakes</span>
                    <strong id="winMistakes">0/3</strong>
                </div>

                <div>
                    <span>Best</span>
                    <strong id="winBestTime">--:--</strong>
                </div>
            </div>

            <div class="win-actions">
                <button id="winHomeBtn" class="back-btn">
                    Home
                </button>

                <button id="winNewGameBtn" class="next-btn">
                    New Game
                </button>
            </div>
        </div>
    </div>


    <!-- Game Over Modal -->
    <div id="gameOverModal" class="modal">
        <div class="modal-content game-over-content">

            <h2>Game Over</h2>
            <p>You made 3 mistakes.</p>

            <div class="game-over-stats">
                <span>Time</span>
                <strong id="gameOverTime">00:00</strong>
            </div>

            <div class="game-over-actions">
                <button id="gameOverHomeBtn" class="back-btn">
                    Home
                </button>

                <button id="gameOverNewBtn" class="next-btn">
                    New Game
                </button>
            </div>
        </div>
    </div>

    <!-- Stats Modal -->
    <div id="statsModal" class="stats-modal">

        <div class="stats-content">

            <button id="closeStatsBtn" class="stats-close-btn">
                ×
            </button>

            <h2>📊 Statistics</h2>

            <div class="stats-summary">

                <div class="stat-box">
                    <span>Games Played</span>
                    <strong id="statGamesPlayed">0</strong>
                </div>

                <div class="stat-box">
                    <span>Games Won</span>
                    <strong id="statGamesWon">0</strong>
                </div>

                <div class="stat-box">
                    <span>Win Rate</span>
                    <strong id="statWinRate">0%</strong>
                </div>

                <div class="stat-box">
                    <span>Best Streak</span>
                    <strong id="statBestStreak">0</strong>
                </div>

            </div>

            <h3>🏆 Personal Bests</h3>

            <div class="best-times-table">

                <div class="best-header">
                    <span></span>
                    <strong>6×6</strong>
                    <strong>9×9</strong>
                </div>

                <div class="best-row">
                    <span>Easy</span>
                    <strong id="best6Easy">--:--</strong>
                    <strong id="best9Easy">--:--</strong>
                </div>

                <div class="best-row">
                    <span>Medium</span>
                    <strong id="best6Medium">--:--</strong>
                    <strong id="best9Medium">--:--</strong>
                </div>

                <div class="best-row">
                    <span>Hard</span>
                    <strong id="best6Hard">--:--</strong>
                    <strong id="best9Hard">--:--</strong>
                </div>

                <div class="best-row">
                    <span>Expert</span>
                    <strong id="best6Expert">--:--</strong>
                    <strong id="best9Expert">--:--</strong>
                </div>

            </div>

        </div>

    </div>

    <script src="js/sudoku.js"></script>
    <script src="js/timer.js"></script>
    <script src="js/game.js"></script>
    <script src="js/app.js"></script>

</body>

</html>