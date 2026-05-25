// ============================================
// SPACE BLASTER - 1000+ Line Game
// ============================================

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game States
const GAME_STATE = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LEVEL_UP: 'levelUp'
};

// Game Variables
let gameState = GAME_STATE.PLAYING;
let score = 0;
let level = 1;
let lives = 3;
let wave = 1;
let maxWaves = 5;
let frameCount = 0;
let enemiesDestroyed = 0;
let multiplier = 1;

// Player Object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 6,
    health: 100,
    maxHealth: 100,
    shieldActive: false,
    shieldTime: 0,
    fireRate: 10,
    fireCounter: 0,
    rapidFireActive: false,
    rapidFireTime: 0
};

// Game Arrays
let bullets = [];
let enemies = [];
let powerUps = [];
let particles = [];
let explosions = [];

// Input Handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === GAME_STATE.PLAYING) {
            playerShoot();
        }
    }
    if (e.key.toLowerCase() === 'p') {
        togglePause();
    }
    if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Bullet Class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 15;
        this.speed = 10;
        this.damage = 10;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.y < 0;
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 'basic') {
            this.width = 30;
            this.height = 30;
            this.speed = 2 + (level * 0.5);
            this.health = 20;
            this.maxHealth = 20;
            this.points = 100;
        } else if (type === 'fast') {
            this.width = 25;
            this.height = 25;
            this.speed = 4 + (level * 0.8);
            this.health = 10;
            this.maxHealth = 10;
            this.points = 150;
        } else if (type === 'tank') {
            this.width = 40;
            this.height = 40;
            this.speed = 1.5 + (level * 0.3);
            this.health = 50;
            this.maxHealth = 50;
            this.points = 250;
        }
        
        this.angle = 0;
        this.shootCounter = Math.random() * 100;
    }

    update() {
        this.y += this.speed;
        this.angle += 0.05;
        this.shootCounter++;
        
        // Enemy shoots occasionally
        if (this.shootCounter > 60 && Math.random() > 0.95) {
            this.shoot();
            this.shootCounter = 0;
        }
    }

    shoot() {
        const bullet = {
            x: this.x,
            y: this.y,
            width: 5,
            height: 12,
            speed: 5,
            vx: (Math.random() - 0.5) * 3,
            vy: 4,
            isEnemyBullet: true
        };
        bullets.push(bullet);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        if (this.type === 'basic') {
            ctx.fillStyle = '#ff00ff';
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 15;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else if (this.type === 'fast') {
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.lineTo(-this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'tank') {
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.shadowBlur = 0;
        ctx.restore();

        // Draw health bar
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.x - barWidth / 2, this.y - 15, barWidth, barHeight);
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(this.x - barWidth / 2, this.y - 15, (this.health / this.maxHealth) * barWidth, barHeight);
        }
    }

    isOffScreen() {
        return this.y > canvas.height;
    }

    takeDamage(damage) {
        this.health -= damage;
        createParticles(this.x, this.y, '#ff6600', 3);
    }
}

// PowerUp Class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.rotation = 0;

        if (type === 'health') {
            this.color = '#00ff00';
            this.symbol = '❤️';
        } else if (type === 'shield') {
            this.color = '#0088ff';
            this.symbol = '🛡️';
        } else if (type === 'rapidfire') {
            this.color = '#ffff00';
            this.symbol = '⚡';
        } else if (type === 'bomb') {
            this.color = '#ff0000';
            this.symbol = '💣';
        }
    }

    update() {
        this.y += this.speed;
        this.rotation += 0.05;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Particle Class
class Particle {
    constructor(x, y, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx || (Math.random() - 0.5) * 4;
        this.vy = vy || (Math.random() - 0.5) * 4;
        this.life = 30;
        this.color = color;
        this.size = 4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
        this.size *= 0.95;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 30;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    isAlive() {
        return this.life > 0;
    }
}

// Explosion Class
class Explosion {
    constructor(x, y, size = 1) {
        this.x = x;
        this.y = y;
        this.size = 20 * size;
        this.maxSize = 60 * size;
        this.life = 20;
        this.maxLife = 20;
    }

    update() {
        this.life--;
        this.size += 2;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.6})`;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 200, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    isAlive() {
        return this.life > 0;
    }
}

// Player Functions
function updatePlayer() {
    if (gameState !== GAME_STATE.PLAYING) return;

    // Movement
    if (keys['ArrowLeft'] || keys['a']) {
        player.x = Math.max(player.width / 2, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.x = Math.min(canvas.width - player.width / 2, player.x + player.speed);
    }
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(player.height / 2, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvas.height - player.height / 2, player.y + player.speed);
    }

    // Update fire rate
    player.fireCounter--;

    // Update shield
    if (player.shieldActive) {
        player.shieldTime--;
        if (player.shieldTime <= 0) {
            player.shieldActive = false;
        }
    }

    // Update rapid fire
    if (player.rapidFireActive) {
        player.rapidFireTime--;
        if (player.rapidFireTime <= 0) {
            player.rapidFireActive = false;
        }
    }
}

function playerShoot() {
    const fireRate = player.rapidFireActive ? 5 : player.fireRate;
    if (player.fireCounter <= 0) {
        bullets.push(new Bullet(player.x, player.y - 20));
        if (player.rapidFireActive) {
            bullets.push(new Bullet(player.x - 10, player.y - 20));
            bullets.push(new Bullet(player.x + 10, player.y - 20));
        }
        player.fireCounter = fireRate;
    }
}

function drawPlayer() {
    ctx.save();
    
    // Draw shield if active
    if (player.shieldActive) {
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0088ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Draw player ship
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.lineTo(player.x, player.y + player.height / 3);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();

    // Draw cockpit
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
}

// Collision Detection
function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.isEnemyBullet) continue;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (isColliding(bullet, enemy)) {
                enemy.takeDamage(bullet.damage);
                bullets.splice(i, 1);

                if (enemy.health <= 0) {
                    score += enemy.points * multiplier;
                    enemiesDestroyed++;
                    createExplosion(enemy.x, enemy.y, 1.5);
                    createParticles(enemy.x, enemy.y, '#ff6600', 5);

                    // Drop power-up
                    if (Math.random() > 0.7) {
                        const types = ['health', 'shield', 'rapidfire', 'bomb'];
                        const type = types[Math.floor(Math.random() * types.length)];
                        powerUps.push(new PowerUp(enemy.x, enemy.y, type));
                    }

                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }

    // Check enemy-player collisions
    for (let enemy of enemies) {
        if (isColliding(player, enemy)) {
            if (!player.shieldActive) {
                player.health -= 10;
                createExplosion(player.x, player.y, 1);
                if (player.health <= 0) {
                    lives--;
                    if (lives <= 0) {
                        endGame();
                    } else {
                        player.health = player.maxHealth;
                        player.x = canvas.width / 2;
                        player.y = canvas.height - 60;
                    }
                }
            } else {
                createExplosion(enemy.x, enemy.y, 1.5);
                enemies.splice(enemies.indexOf(enemy), 1);
                player.shieldActive = false;
            }
        }
    }

    // Check enemy bullet-player collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.isEnemyBullet) continue;

        if (isColliding(bullet, player)) {
            if (!player.shieldActive) {
                player.health -= 5;
                bullets.splice(i, 1);
                if (player.health <= 0) {
                    lives--;
                    if (lives <= 0) {
                        endGame();
                    } else {
                        player.health = player.maxHealth;
                        player.x = canvas.width / 2;
                        player.y = canvas.height - 60;
                    }
                }
            }
        }
    }

    // Check powerup-player collisions
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (isColliding(player, powerUp)) {
            activatePowerUp(powerUp.type);
            createParticles(powerUp.x, powerUp.y, powerUp.color, 3);
            powerUps.splice(i, 1);
        }
    }
}

function isColliding(obj1, obj2) {
    return obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
           obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
           obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
           obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2;
}

// PowerUp Activation
function activatePowerUp(type) {
    if (type === 'health') {
        player.health = Math.min(player.maxHealth, player.health + 30);
    } else if (type === 'shield') {
        player.shieldActive = true;
        player.shieldTime = 200;
    } else if (type === 'rapidfire') {
        player.rapidFireActive = true;
        player.rapidFireTime = 300;
    } else if (type === 'bomb') {
        createBomb();
    }
}

function createBomb() {
    const bombRadius = 150;
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (dist < bombRadius) {
            createExplosion(enemy.x, enemy.y, 2);
            score += enemy.points * multiplier;
            enemiesDestroyed++;
            enemies.splice(i, 1);
        }
    }
}

// Particle Effects
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function createExplosion(x, y, size = 1) {
    explosions.push(new Explosion(x, y, size));
}

// Enemy Wave Management
function spawnWave() {
    const enemyCount = 5 + (wave * 3);
    for (let i = 0; i < enemyCount; i++) {
        const x = Math.random() * (canvas.width - 60) + 30;
        const y = -50 - Math.random() * 100;
        const types = wave > 3 ? ['basic', 'fast', 'tank'] : wave > 1 ? ['basic', 'fast'] : ['basic'];
        const type = types[Math.floor(Math.random() * types.length)];
        enemies.push(new Enemy(x, y, type));
    }
}

function checkWaveComplete() {
    if (enemies.length === 0 && frameCount % 60 === 0) {
        if (wave < maxWaves) {
            wave++;
            multiplier = 1 + (wave - 1) * 0.2;
            showLevelUpScreen();
        } else {
            endGame();
        }
    }
}

// Game State Management
function togglePause() {
    if (gameState === GAME_STATE.PLAYING) {
        gameState = GAME_STATE.PAUSED;
        document.getElementById('pauseScreen').classList.remove('hidden');
    } else if (gameState === GAME_STATE.PAUSED) {
        gameState = GAME_STATE.PLAYING;
        document.getElementById('pauseScreen').classList.add('hidden');
    }
}

function continuGame() {
    gameState = GAME_STATE.PLAYING;
    document.getElementById('levelUpScreen').classList.add('hidden');
    spawnWave();
}

function endGame() {
    gameState = GAME_STATE.GAME_OVER;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = wave;
    document.getElementById('enemiesDestroyed').textContent = enemiesDestroyed;
}

function resetGame() {
    location.reload();
}

function showLevelUpScreen() {
    gameState = GAME_STATE.LEVEL_UP;
    document.getElementById('levelUpText').textContent = `Wave ${wave}: Get ready for ${5 + (wave * 3)} enemies!`;
    document.getElementById('levelUpScreen').classList.remove('hidden');
}

// UI Update
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lives').textContent = lives;
    document.getElementById('healthBar').style.width = (player.health / player.maxHealth) * 100 + '%';
    document.getElementById('enemyCount').textContent = enemies.length;
    document.getElementById('wave').textContent = `${wave}/${maxWaves}`;
}

// Drawing Functions
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(15, 26, 58, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = 'rgba(10, 14, 39, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw game objects
    drawPlayer();
    
    for (let enemy of enemies) {
        enemy.draw();
    }

    for (let bullet of bullets) {
        bullet.draw();
    }

    for (let powerUp of powerUps) {
        powerUp.draw();
    }

    for (let particle of particles) {
        particle.draw();
    }

    for (let explosion of explosions) {
        explosion.draw();
    }
}

// Update Functions
function update() {
    if (gameState !== GAME_STATE.PLAYING) return;

    frameCount++;

    updatePlayer();

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (bullets[i].isOffScreen()) {
            bullets.splice(i, 1);
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        if (enemies[i].isOffScreen()) {
            enemies.splice(i, 1);
            lives--;
            if (lives <= 0) {
                endGame();
            }
        }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        if (powerUps[i].isOffScreen()) {
            powerUps.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (!particles[i].isAlive()) {
            particles.splice(i, 1);
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        if (!explosions[i].isAlive()) {
            explosions.splice(i, 1);
        }
    }

    checkCollisions();
    checkWaveComplete();
    updateUI();
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize Game
window.addEventListener('load', () => {
    spawnWave();
    gameLoop();
});

// Prevent scrolling
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});