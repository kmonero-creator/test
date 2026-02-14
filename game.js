const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const restartBtn = document.getElementById('restartBtn');
const installBtn = document.getElementById('installBtn');

const width = canvas.width;
const height = canvas.height;

let score = 0;
let timeLeft = 45;
let gameOver = false;
let rafId;
let timerId;
let deferredPrompt;

const player = {
  x: width / 2,
  y: height - 58,
  width: 52,
  height: 24,
  speed: 6,
  vx: 0,
};

const drops = [];

function spawnDrop() {
  const bad = Math.random() < 0.3;
  drops.push({
    x: 18 + Math.random() * (width - 36),
    y: -30,
    vy: 2.4 + Math.random() * 2.8,
    emoji: bad ? '💔' : '❤️',
    value: bad ? -8 : 10,
    size: 24,
  });
}

function drawPlayer() {
  ctx.fillStyle = '#003893';
  ctx.beginPath();
  ctx.roundRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height, 8);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🇳🇵', player.x, player.y + 5);
}

function drawDrop(drop) {
  ctx.font = `${drop.size}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(drop.emoji, drop.x, drop.y);
}

function update() {
  player.x += player.vx;
  player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, player.x));

  if (Math.random() < 0.055) {
    spawnDrop();
  }

  for (let i = drops.length - 1; i >= 0; i -= 1) {
    const d = drops[i];
    d.y += d.vy;

    const hitsPlayer =
      d.x > player.x - player.width / 2 &&
      d.x < player.x + player.width / 2 &&
      d.y > player.y - player.height / 2 &&
      d.y < player.y + player.height / 2 + 10;

    if (hitsPlayer) {
      score = Math.max(0, score + d.value);
      drops.splice(i, 1);
      scoreEl.textContent = score;
      continue;
    }

    if (d.y > height + 30) {
      drops.splice(i, 1);
    }
  }
}

function render() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let y = 20; y < height; y += 72) {
    ctx.fillRect(0, y, width, 1);
  }

  drawPlayer();
  drops.forEach(drawDrop);

  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Time Up!', width / 2, height / 2 - 18);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`Score: ${score}`, width / 2, height / 2 + 22);
  }
}

function loop() {
  update();
  render();
  if (!gameOver) {
    rafId = requestAnimationFrame(loop);
  }
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = Math.max(timeLeft, 0);
    if (timeLeft <= 0) {
      gameOver = true;
      clearInterval(timerId);
      cancelAnimationFrame(rafId);
      render();
    }
  }, 1000);
}

function resetGame() {
  score = 0;
  timeLeft = 45;
  gameOver = false;
  drops.length = 0;
  player.x = width / 2;
  player.vx = 0;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  clearInterval(timerId);
  cancelAnimationFrame(rafId);
  startTimer();
  loop();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
    player.vx = -player.speed;
  }
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
    player.vx = player.speed;
  }
});

window.addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
    player.vx = 0;
  }
});

let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
canvas.addEventListener('touchmove', (e) => {
  const delta = e.touches[0].clientX - touchStartX;
  player.x += delta * 0.15;
  touchStartX = e.touches[0].clientX;
});

restartBtn.addEventListener('click', resetGame);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) {
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

resetGame();
