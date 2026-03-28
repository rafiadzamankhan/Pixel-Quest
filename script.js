const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreVal');

// 1. GAME STATE
let score = 0;
const keys = {};

const player = { x: 50, y: 50, size: 30, speed: 6, color: '#00d2ff' };
const goal = { x: 500, y: 300, size: 12, color: '#ffd700' };
const enemies = [
    { x: 200, y: 100, size: 24, dx: 4, dy: 4, color: '#ff4d4d' },
    { x: 400, y: 200, size: 30, dx: -3, dy: 5, color: '#ff4d4d' }
];

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
    // Movement Logic
    if (keys['ArrowUp'] || keys['KeyW']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;

    // Player Boundaries
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

    // Enemy Logic & Bouncing
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
            // Reset player position
            player.x = 50; 
            player.y = 50;
        }
    });

    // Player-Goal Collision (Circle distance formula)
    let dx = (player.x + player.size / 2) - goal.x;
    let dy = (player.y + player.size / 2) - goal.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (player.size / 2) + goal.size) {
        score += 10;
        scoreElement.innerText = score;
        // Randomize goal position
        goal.x = Math.random() * (canvas.width - 40) + 20;
        goal.y = Math.random() * (canvas.height - 40) + 20;
    }
}

// 5. RENDERING
function draw() {
    // Clear Canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Pixel Grid Background
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
    
    // Reset shadow blur to avoid performance issues
    ctx.shadowBlur = 0;
}

// 6. MAIN LOOP
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();