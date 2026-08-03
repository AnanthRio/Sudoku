let elapsedSeconds = 0;
let timerInterval = null;


function startTimer() {
    // Prevent multiple timers running
    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimerDisplay() {

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const formattedTime =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
    gameTimer.textContent = formattedTime;
    pausedTime.textContent = formattedTime;
}