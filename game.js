const players = [
  { name: "Himalayan Heart", health: 100, ammo: 6 },
  { name: "Kathmandu Cupid", health: 100, ammo: 6 },
];

let turn = 0;
let gameOver = false;

const ui = {
  p1Health: document.getElementById("p1-health"),
  p2Health: document.getElementById("p2-health"),
  p1Ammo: document.getElementById("p1-ammo"),
  p2Ammo: document.getElementById("p2-ammo"),
  turn: document.getElementById("turn"),
  message: document.getElementById("message"),
  p1Shoot: document.getElementById("p1-shoot"),
  p2Shoot: document.getElementById("p2-shoot"),
  p1Reload: document.getElementById("p1-reload"),
  p2Reload: document.getElementById("p2-reload"),
  restart: document.getElementById("restart"),
};

function nextTurn() {
  turn = turn === 0 ? 1 : 0;
  ui.turn.textContent = `Turn: ${players[turn].name}`;
}

function render() {
  ui.p1Health.textContent = players[0].health;
  ui.p2Health.textContent = players[1].health;
  ui.p1Ammo.textContent = players[0].ammo;
  ui.p2Ammo.textContent = players[1].ammo;

  const p1Turn = turn === 0 && !gameOver;
  const p2Turn = turn === 1 && !gameOver;

  ui.p1Shoot.disabled = !p1Turn;
  ui.p1Reload.disabled = !p1Turn;
  ui.p2Shoot.disabled = !p2Turn;
  ui.p2Reload.disabled = !p2Turn;
}

function shoot(shooterIndex) {
  if (gameOver || shooterIndex !== turn) {
    return;
  }

  const targetIndex = shooterIndex === 0 ? 1 : 0;
  const shooter = players[shooterIndex];
  const target = players[targetIndex];

  if (shooter.ammo <= 0) {
    ui.message.textContent = `${shooter.name} is out of ammo. Reload first!`;
    return;
  }

  const damage = Math.floor(Math.random() * 16) + 10;
  shooter.ammo -= 1;
  target.health = Math.max(0, target.health - damage);

  if (target.health === 0) {
    gameOver = true;
    ui.message.textContent = `${shooter.name} wins the Valentine bed in Nepal! 💘🛏️`;
    ui.turn.textContent = "Game Over";
  } else {
    ui.message.textContent = `${shooter.name} blasts for ${damage} damage!`;
    nextTurn();
  }

  render();
}

function reload(playerIndex) {
  if (gameOver || playerIndex !== turn) {
    return;
  }

  players[playerIndex].ammo = 6;
  ui.message.textContent = `${players[playerIndex].name} reloads and passes the turn.`;
  nextTurn();
  render();
}

function resetGame() {
  players[0].health = 100;
  players[1].health = 100;
  players[0].ammo = 6;
  players[1].ammo = 6;
  turn = 0;
  gameOver = false;
  ui.turn.textContent = `Turn: ${players[turn].name}`;
  ui.message.textContent = "New match started. Fight for the bed!";
  render();
}

ui.p1Shoot.addEventListener("click", () => shoot(0));
ui.p2Shoot.addEventListener("click", () => shoot(1));
ui.p1Reload.addEventListener("click", () => reload(0));
ui.p2Reload.addEventListener("click", () => reload(1));
ui.restart.addEventListener("click", resetGame);

render();
