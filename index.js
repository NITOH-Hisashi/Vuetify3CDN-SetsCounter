let countdownInterval;

function startCountdown(seconds) {
    const circle = document.getElementById('circle');
    const numberText = document.getElementById('number');

    let currentNumber = seconds;

    function decrementNumber() {
        // 一旦アニメーションをリセット
        circle.classList.remove('animate');
        circle.classList.add('reset');

        if (currentNumber > 0) {
            currentNumber--;
            numberText.textContent = currentNumber;
            animateCircle();
        }
    }

    function animateCircle() {
        circle.classList.remove('reset');
        void circle.offsetWidth; // Reflowをトリガー

        setTimeout(function () {
            circle.classList.add('animate');
        }, 50); // 50ミリ秒の待ち時間
    }

    // 初期値をセット
    numberText.textContent = currentNumber;
    animateCircle();

    countdownInterval = setInterval(() => {
        decrementNumber();
        if (currentNumber <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000); // 1000ミリ秒ごとにカウントダウン
}

function startCountdownFromInput() {
    const countdownInput = document.getElementById('countdown-seconds');
    const countdownSeconds = parseInt(countdownInput.value, 10);
    if (isNaN(countdownSeconds) || countdownSeconds <= 0) {
        alert('有効な秒数を入力してください');
        return;
    }

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    startCountdown(countdownSeconds);
}

document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-button');
    const countdownInput = document.getElementById('countdown-seconds');

    startButton.addEventListener('click', startCountdownFromInput);
    countdownInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            startCountdownFromInput();
        }
    });
});
