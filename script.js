const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("status");

const width = canvas.width;
const height = canvas.height;

const player = {
  x: width / 2,
  y: height - 40,
  width: 40,
  height: 16,
  speed: 6,
  color: "#43d9ff",
};

let bullets = [];
let enemies = [];
let score = 0;
let lives = 3;
let gameOver = false;
let keys = {};
let spawnTimer = 0;
let spawnInterval = 80;

function resetGame() {
  bullets = [];
  enemies = [];
  score = 0;
  lives = 3;
  gameOver = false;
  spawnTimer = 0;
  statusEl.textContent = "遊戲開始！按空白鍵射擊。";
  statusEl.classList.remove("game-over");
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
}

function drawCircle(obj) {
  ctx.beginPath();
  ctx.fillStyle = obj.color;
  ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
  ctx.fill();
}

function spawnEnemy() {
  const size = 28;
  const x = Math.random() * (width - size) + size / 2;
  enemies.push({
    x,
    y: -size,
    radius: size / 2,
    speed: 1.5 + Math.random() * 1.3,
    color: "#ff5d5d",
  });
}

function fireBullet() {
  bullets.push({
    x: player.x,
    y: player.y - player.height / 2 - 10,
    width: 4,
    height: 14,
    speed: 8,
    color: "#d3f8ff",
  });
}

function update() {
  if (gameOver) return;

  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
    player.x += player.speed;
  }
  player.x = Math.min(Math.max(player.x, player.width / 2), width - player.width / 2);

  bullets = bullets.filter((bullet) => bullet.y + bullet.height > 0);
  bullets.forEach((bullet) => {
    bullet.y -= bullet.speed;
  });

  enemies.forEach((enemy) => {
    enemy.y += enemy.speed;
  });

  enemies = enemies.filter((enemy) => {
    if (enemy.y - enemy.radius > height) {
      lives -= 1;
      livesEl.textContent = lives;
      return false;
    }
    return true;
  });

  bullets.forEach((bullet) => {
    enemies.forEach((enemy) => {
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < enemy.radius + bullet.width / 2) {
        enemy.hit = true;
        bullet.hit = true;
      }
    });
  });

  const hitEnemies = enemies.filter((enemy) => enemy.hit);
  if (hitEnemies.length) {
    score += hitEnemies.length * 10;
    scoreEl.textContent = score;
  }
  enemies = enemies.filter((enemy) => !enemy.hit);
  bullets = bullets.filter((bullet) => !bullet.hit);

  enemies.forEach((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < enemy.radius + player.height / 2) {
      enemy.hit = true;
      lives -= 1;
      livesEl.textContent = lives;
    }
  });
  enemies = enemies.filter((enemy) => !enemy.hit);

  if (lives <= 0) {
    gameOver = true;
    statusEl.textContent = "遊戲結束！按 R 重新開始。";
    statusEl.classList.add("game-over");
  }

  spawnTimer += 1;
  if (spawnTimer >= spawnInterval) {
    spawnEnemy();
    spawnTimer = 0;
    if (spawnInterval > 40) spawnInterval -= 0.8;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, width, height);

  drawRect({ ...player, color: player.color });
  bullets.forEach((bullet) => drawRect(bullet));
  enemies.forEach((enemy) => drawCircle(enemy));

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(0, 0, width, 3);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(0, height - 2, width, 2);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (!gameOver) fireBullet();
  }
  if (event.key === "r" || event.key === "R") {
    resetGame();
  }
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

resetGame();
loop();
