const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const hpEl = document.getElementById("hp");

const logo = new Image();
logo.src = "logo.png";

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const player = {
  x: 2,
  y: 2,
  angle: 0,
  speed: 0.06,
  hp: 100
};

const enemies = [
  { x: 8, y: 8, alive: true },
  { x: 10, y: 3, alive: true },
  { x: 5, y: 6, alive: true }
];

const keys = {};

addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
  shoot();
});

addEventListener("mousemove", e => {
  if (document.pointerLockElement === canvas) {
    player.angle += e.movementX * 0.002;
  }
});

function shoot() {
  document.body.classList.add("flash");
  setTimeout(() => document.body.classList.remove("flash"), 50);

  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const angle = Math.atan2(dy, dx);
    let diff = Math.abs(angle - player.angle);

    if (diff > Math.PI) {
      diff = Math.PI * 2 - diff;
    }

    if (diff < 0.15) {
      enemy.alive = false;
    }
  });
}

function update() {
  let moveX = 0;
  let moveY = 0;

  if (keys["w"]) {
    moveX += Math.cos(player.angle) * player.speed;
    moveY += Math.sin(player.angle) * player.speed;
  }

  if (keys["s"]) {
    moveX -= Math.cos(player.angle) * player.speed;
    moveY -= Math.sin(player.angle) * player.speed;
  }

  if (keys["a"]) {
    moveX += Math.cos(player.angle - Math.PI / 2) * player.speed;
    moveY += Math.sin(player.angle - Math.PI / 2) * player.speed;
  }

  if (keys["d"]) {
    moveX += Math.cos(player.angle + Math.PI / 2) * player.speed;
    moveY += Math.sin(player.angle + Math.PI / 2) * player.speed;
  }

  const newX = player.x + moveX;
  const newY = player.y + moveY;

  if (map[Math.floor(player.y)][Math.floor(newX)] === 0) {
    player.x = newX;
  }

  if (map[Math.floor(newY)][Math.floor(player.x)] === 0) {
    player.y = newY;
  }

  enemyAI();
  hpEl.textContent = Math.max(0, Math.floor(player.hp));
}

function enemyAI() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.5) {
      player.hp -= 0.1;
    }

    if (dist < 6) {
      enemy.x += dx * 0.003;
      enemy.y += dy * 0.003;
    }
  });
}

function render() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

  const fov = Math.PI / 3;

  for (let x = 0; x < canvas.width; x++) {
    const rayAngle = player.angle - fov / 2 + (x / canvas.width) * fov;

    let distance = 0;
    let hit = false;
    let wallType = 1;

    while (!hit && distance < 20) {
      distance += 0.02;

      const testX = Math.floor(player.x + Math.cos(rayAngle) * distance);
      const testY = Math.floor(player.y + Math.sin(rayAngle) * distance);

      if (map[testY] && map[testY][testX] > 0) {
        wallType = map[testY][testX];
        hit = true;
      }
    }

    const wallHeight = canvas.height / distance;

    if (wallType === 2 && logo.complete && logo.naturalWidth) {
      ctx.drawImage(
        logo,
        0,
        0,
        logo.width,
        logo.height,
        x,
        canvas.height / 2 - wallHeight / 2,
        1,
        wallHeight
      );
    } else {
      const shade = 255 - distance * 12;
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, canvas.height / 2 - wallHeight / 2, 1, wallHeight);
    }
  }

  renderEnemies();
  renderGun();
}

function renderEnemies() {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - player.angle;
    const size = 500 / distance;
    const screenX = canvas.width / 2 + Math.tan(angle) * 500;

    ctx.fillStyle = "#c0392b";
    ctx.fillRect(
      screenX - size / 2,
      canvas.height / 2 - size / 2,
      size,
      size
    );
  });
}

function renderGun() {
  ctx.fillStyle = "#7f8c8d";
  ctx.fillRect(canvas.width / 2 - 80, canvas.height - 120, 160, 100);
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loop();

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});
