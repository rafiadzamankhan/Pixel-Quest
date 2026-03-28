const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreVal');

const startStopBtn = document.getElementById('startStopBtn');
let isGameRunning = false;
let animationId; // This holds the reference to the loop

const restartBtn = document.getElementById('restartBtn');

// 1. GAME STATE
const levelElement = document.getElementById('lvlVal'); // New

let score = 0;
let currentLevel = 1; // New
const keys = {};

const player = { x: 50, y: 50, size: 30, speed: 6, color: '#00d2ff' };
const goal = { x: 500, y: 300, size: 12, color: '#ffd700' };

// Start with one enemy for Level 1
let enemies = [];
function createEnemies(count) {
    enemies = [];
    for (let i = 0; i < count; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 30),
            size: 24 + Math.random() * 10,
            dx: (Math.random() < 0.5 ? 1 : -1) * (3 + Math.random() * 2),
            dy: (Math.random() < 0.5 ? 1 : -1) * (3 + Math.random() * 2),
            color: '#ff4d4d'
        });
    }
}
// Initial creation
createEnemies(1);

// 2. INPUT HANDLING (PC)
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// 3. INPUT HANDLING (MOBILE/TOUCH)
const setupMobileBtn = (id, code) => {
    const btn = document.getElementById(id);
    
    // Handles both touch and mouse clicks for the D-Pad
    const startAction = (e) => {
        e.preventDefault();
        keys[code] = true;
    };
    
    const endAction = (e) => {
        e.preventDefault();
        keys[code] = false;
    };

    btn.addEventListener('touchstart', startAction);
    btn.addEventListener('touchend', endAction);
    btn.addEventListener('mousedown', startAction);
    btn.addEventListener('mouseup', endAction);
    btn.addEventListener('mouseleave', endAction); // Stops movement if finger slides off
};

setupMobileBtn('ctrl-Up', 'KeyW');
setupMobileBtn('ctrl-Down', 'KeyS');
setupMobileBtn('ctrl-Left', 'KeyA');
setupMobileBtn('ctrl-Right', 'KeyD');

// 4. LOGIC & PHYSICS
function update() {
    // 1. Movement Logic
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;

    // 2. Player Boundaries
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

    // 3. Enemy Logic & Bouncing
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;

        if (enemy.x <= 0 || enemy.x + enemy.size >= canvas.width) enemy.dx *= -1;
        if (enemy.y <= 0 || enemy.y + enemy.size >= canvas.height) enemy.dy *= -1;

        // Player-Enemy Collision
        if (player.x < enemy.x + enemy.size && player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size && player.y + player.size > enemy.y) {
            score = Math.max(0, score - 5);
            scoreElement.innerText = score;
            player.x = 50; 
            player.y = 50;
        }
    });

    // 4. Player-Goal Collision (CRITICAL MATH FIX)
    let dx = (player.x + player.size / 2) - goal.x;
    let dy = (player.y + player.size / 2) - goal.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (player.size / 2) + goal.size) {
        score += 10;
        scoreElement.innerText = score;

        let newLevel = Math.floor(score / 100) + 1;
        if (newLevel > currentLevel) {
            currentLevel = newLevel;
            levelElement.innerText = currentLevel;
            createEnemies(currentLevel); 
        }

        goal.x = Math.random() * (canvas.width - 40) + 20;
        goal.y = Math.random() * (canvas.height - 40) + 20;
    }
}



// 5. RENDERING
function draw() {
    // Clear Canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // LOGIC: If game hasn't started yet and score is 0, keep it black
    if (!isGameRunning && score === 0 && startStopBtn.innerText === "START GAME") {
        return; 
    }

    // LOGIC: If paused, apply grayscale filter
    if (!isGameRunning) {
        ctx.filter = "grayscale(100%) brightness(0.5)";
    } else {
        ctx.filter = "none";
    }

    // Draw Subtle Pixel Grid
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // Draw Entities with Glow
    ctx.shadowBlur = 12;
    
    // Player
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Enemies
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.fillRect(e.x, e.y, e.size, e.size);
    });

    // Goal
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, goal.size, 0, Math.PI * 2);
    ctx.fillStyle = goal.color;
    ctx.shadowColor = goal.color;
    ctx.fill();
    ctx.closePath();
    
    ctx.shadowBlur = 0;
    ctx.filter = "none"; // Always reset filter at the end
}

// 6. CORE CONTROL FUNCTIONS
function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        startStopBtn.innerText = "PAUSE";
        startStopBtn.style.background = "#ff4d4d";
        // Show restart button once the game has been interacted with
        restartBtn.style.display = "flex"; 
        gameLoop();
    }
}

function pauseGame() {
    isGameRunning = false;
    startStopBtn.innerText = "RESUME";
    startStopBtn.style.background = "#00d2ff";
    cancelAnimationFrame(animationId);
    draw(); // Draw one last time to apply the grayscale filter
}

// 7. EVENT HANDLERS
startStopBtn.addEventListener('click', () => {
    if (isGameRunning) {
        pauseGame();
    } else {
        startGame();
    }
});

restartBtn.addEventListener('click', () => {
    pauseGame();
    
    score = 0;
    currentLevel = 1;
    scoreElement.innerText = score;
    levelElement.innerText = currentLevel;
    
    player.x = 50;
    player.y = 50;
    goal.x = 500;
    goal.y = 300;

    createEnemies(1); // Reset to 1 enemy
    
    startStopBtn.innerText = "START GAME";
    draw(); 
});

// 8. MAIN LOOP
function gameLoop() {
    if (!isGameRunning) return; 

    // Moving this to the top ensures the loop tries to keep going
    animationId = requestAnimationFrame(gameLoop);

    update();
    draw();
}
