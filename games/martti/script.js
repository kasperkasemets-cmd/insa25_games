// Mängu muutujad
let score = 0;
let timeLeft = 30;
let timer;
let isPlaying = false;

// Elemendid DOM-ist (HTML-ist)
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');
const target = document.getElementById('target');

// Nuppudele reageerimine
startBtn.addEventListener('click', startGame);
target.addEventListener('mousedown', hitTarget); 

function startGame() {
    if (isPlaying) return;
    
    // Algseaded
    isPlaying = true;
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    startBtn.disabled = true; // Keelame nupu mängu ajaks
    target.style.display = 'block'; // Teeme ringi nähtavaks
    
    moveTarget(); // Paneme ringi esimesse kohta

    // Taimer
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function hitTarget() {
    if (!isPlaying) return;
    score++; // Lisame punkti
    scoreDisplay.textContent = score;
    moveTarget(); // Liigutame ringi uude kohta
}

function moveTarget() {
    // Arvutame koordinaadid, et ring ei läheks kastist välja
    const maxX = gameContainer.clientWidth - target.clientWidth;
    const maxY = gameContainer.clientHeight - target.clientHeight;
    
    // Juhuslikud asukohad
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    // Rakendame koordinaadid
    target.style.left = randomX + 'px';
    target.style.top = randomY + 'px';
}

function endGame() {
    isPlaying = false;
    clearInterval(timer); // Peatame aja
    target.style.display = 'none'; // Peidame ringi
    startBtn.disabled = false;
    startBtn.textContent = 'Mängi Uuesti';
    
    // Tulemuse näitamine
    setTimeout(() => {
        alert(`Aeg läbi! Sinu lõppskoor: ${score} punkti.`);
    }, 50);
}
