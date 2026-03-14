// ===== RYOZODASH - Game Engine =====
// Geometry Dash inspired browser game by RyozoGames

(function() {
'use strict';

// ===== DIFFICULTY CONFIGS =====
const DIFFICULTY_CONFIGS = {
  easy: {
    label: 'LEICHT',
    gravity: 0.55,
    jumpForce: -13.5,
    speedBase: 3.5,
    speedMax: 5.5,
    totalLength: 6000,
    hitboxMargin: 12,
    spikeMargin: 16,
    minGapBase: 300,
    minGapScale: 50,
    maxGapBase: 500,
    maxGapScale: 80,
    mediumThreshold: 0.5,
    hardThreshold: 1.1, // never
    bpm: 110,
    accent: '#00ff88',
  },
  normal: {
    label: 'NORMAL',
    gravity: 0.65,
    jumpForce: -12.5,
    speedBase: 4.5,
    speedMax: 7.5,
    totalLength: 8000,
    hitboxMargin: 8,
    spikeMargin: 12,
    minGapBase: 250,
    minGapScale: 70,
    maxGapBase: 420,
    maxGapScale: 120,
    mediumThreshold: 0.3,
    hardThreshold: 0.6,
    bpm: 140,
    accent: '#00f0ff',
  },
  hard: {
    label: 'SCHWER',
    gravity: 0.75,
    jumpForce: -11.5,
    speedBase: 5.5,
    speedMax: 9.0,
    totalLength: 10000,
    hitboxMargin: 5,
    spikeMargin: 8,
    minGapBase: 200,
    minGapScale: 90,
    maxGapBase: 350,
    maxGapScale: 150,
    mediumThreshold: 0.15,
    hardThreshold: 0.3,
    bpm: 170,
    accent: '#ff0066',
  }
};

let currentDifficulty = localStorage.getItem('ryozodash_difficulty') || 'normal';
let config = DIFFICULTY_CONFIGS[currentDifficulty];

// ===== CANVAS SETUP =====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ===== AUDIO ENGINE =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playJumpSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function playDeathSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

function playCrashSound() {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  source.start();
}

let beatInterval = null;
function startBeat() {
  if (!audioCtx) return;
  let step = 0;
  const interval = 60000 / config.bpm / 2;
  beatInterval = setInterval(() => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    if (step % 4 === 0) {
      osc.type = 'square';
      osc.frequency.value = 80;
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    } else {
      osc.type = 'square';
      osc.frequency.value = 60;
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    }
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
    step++;
  }, interval);
}

function stopBeat() {
  if (beatInterval) { clearInterval(beatInterval); beatInterval = null; }
}

// ===== GAME CONSTANTS =====
const GROUND_Y_RATIO = 0.75;
const PLAYER_SIZE = 40;

// ===== LEVEL GENERATION =====
function generateLevel() {
  const obstacles = [];
  const totalLength = config.totalLength;
  let x = 800;

  const easyPatterns = [
    (startX) => {
      obstacles.push({ type: 'spike', x: startX, w: 40, h: 40 });
      return 40;
    },
    (startX) => {
      obstacles.push({ type: 'block', x: startX, w: 50, h: 50 });
      return 50;
    },
    (startX) => {
      obstacles.push({ type: 'spike', x: startX, w: 40, h: 40 });
      obstacles.push({ type: 'spike', x: startX + 200, w: 40, h: 40 });
      return 240;
    },
  ];

  const mediumPatterns = [
    (startX) => {
      obstacles.push({ type: 'spike', x: startX, w: 40, h: 40 });
      obstacles.push({ type: 'spike', x: startX + 42, w: 40, h: 40 });
      return 84;
    },
    (startX) => {
      obstacles.push({ type: 'gap', x: startX, w: 80 });
      return 80;
    },
    (startX) => {
      obstacles.push({ type: 'block', x: startX, w: 50, h: 50 });
      obstacles.push({ type: 'spike', x: startX + 5, w: 40, h: 40, onBlock: true, blockH: 50 });
      return 50;
    },
    (startX) => {
      obstacles.push({ type: 'block', x: startX, w: 50, h: 40 });
      obstacles.push({ type: 'block', x: startX + 80, w: 50, h: 70 });
      return 130;
    },
  ];

  const hardPatterns = [
    (startX) => {
      for (let i = 0; i < 3; i++) {
        obstacles.push({ type: 'spike', x: startX + i * 42, w: 40, h: 40 });
      }
      return 126;
    },
    (startX) => {
      obstacles.push({ type: 'block', x: startX, w: 40, h: 75 });
      return 40;
    },
    (startX) => {
      obstacles.push({ type: 'gap', x: startX, w: 100 });
      return 100;
    },
    (startX) => {
      for (let i = 0; i < 4; i++) {
        obstacles.push({ type: 'spike', x: startX + i * 42, w: 40, h: 40 });
      }
      return 168;
    },
  ];

  while (x < totalLength) {
    const difficulty = Math.min(x / totalLength, 1);
    let availablePatterns = [...easyPatterns];
    if (difficulty > config.mediumThreshold) availablePatterns.push(...mediumPatterns);
    if (difficulty > config.hardThreshold) availablePatterns.push(...hardPatterns);

    const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    const width = pattern(x);
    const minGap = config.minGapBase - difficulty * config.minGapScale;
    const maxGap = config.maxGapBase - difficulty * config.maxGapScale;
    x += width + minGap + Math.random() * (maxGap - minGap);
  }

  return { obstacles, totalLength };
}

// ===== PARTICLES =====
let particles = [];

function spawnParticles(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const vel = (Math.random() * 0.5 + 0.5) * speed;
    particles.push({
      x, y,
      vx: Math.cos(angle) * vel,
      vy: Math.sin(angle) * vel,
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 3 + Math.random() * 5,
      color
    });
  }
}

function spawnTrail(x, y) {
  particles.push({
    x: x + Math.random() * 6 - 3,
    y: y + Math.random() * 6 - 3,
    vx: -1 - Math.random(),
    vy: (Math.random() - 0.5) * 2,
    life: 1,
    decay: 0.04 + Math.random() * 0.02,
    size: 3 + Math.random() * 3,
    color: player.color
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// ===== BACKGROUND =====
const bgStars = [];
for (let i = 0; i < 100; i++) {
  bgStars.push({
    x: Math.random() * 2000,
    y: Math.random(),
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.3 + 0.1,
    brightness: Math.random() * 0.5 + 0.3
  });
}

function drawBackground(cameraX) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0a001a');
  grad.addColorStop(0.5, '#1a0033');
  grad.addColorStop(1, '#0d0020');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of bgStars) {
    const sx = ((star.x - cameraX * star.speed) % canvas.width + canvas.width) % canvas.width;
    const sy = star.y * canvas.height * 0.7;
    ctx.globalAlpha = star.brightness;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx, sy, star.size, star.size);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#150028';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let i = 0; i <= canvas.width; i += 60) {
    const mountainX = i + cameraX * 0.15;
    const h = Math.sin(mountainX * 0.003) * 80 + Math.sin(mountainX * 0.007) * 40 + 120;
    ctx.lineTo(i, groundY - h);
  }
  ctx.lineTo(canvas.width, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1f0038';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let i = 0; i <= canvas.width; i += 40) {
    const mountainX = i + cameraX * 0.3;
    const h = Math.sin(mountainX * 0.005) * 50 + Math.sin(mountainX * 0.01) * 30 + 70;
    ctx.lineTo(i, groundY - h);
  }
  ctx.lineTo(canvas.width, groundY);
  ctx.closePath();
  ctx.fill();
}

function drawGround(cameraX) {
  ctx.fillStyle = '#2a0050';
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  ctx.shadowColor = '#8800ff';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#8800ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(136, 0, 255, 0.15)';
  ctx.lineWidth = 1;
  const gridSize = 50;
  const offsetX = cameraX % gridSize;
  for (let x = -offsetX; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = groundY + gridSize; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// ===== GAME STATE =====
let groundY;
let gameState = 'menu';
let player;
let level;
let cameraX;
let gameSpeed;
let attempt = 1;
let inputDown = false;
let frameCount = 0;
let deathFreezeFrames = 0;
let screenShake = 0;

const PLAYER_COLORS = ['#00f0ff', '#ff00ff', '#ffff00', '#00ff88', '#ff6600', '#ff0066'];
let colorIndex = 0;

function getBestKey() {
  return 'ryozodash_best_' + currentDifficulty;
}

function getBest() {
  return parseInt(localStorage.getItem(getBestKey()) || '0', 10);
}

function saveBest(percent) {
  const current = getBest();
  if (percent > current) {
    localStorage.setItem(getBestKey(), percent.toString());
  }
}

function initPlayer() {
  groundY = canvas.height * GROUND_Y_RATIO;
  player = {
    x: 150,
    y: groundY - PLAYER_SIZE,
    vy: 0,
    rotation: 0,
    grounded: true,
    alive: true,
    color: PLAYER_COLORS[colorIndex],
  };
}

function initGame() {
  initPlayer();
  level = generateLevel();
  cameraX = 0;
  gameSpeed = config.speedBase;
  particles = [];
  frameCount = 0;
  deathFreezeFrames = 0;
  screenShake = 0;
}

// ===== COLLISION =====
function checkCollision() {
  const px = player.x + cameraX;
  const py = player.y;
  const ps = PLAYER_SIZE;
  const margin = config.hitboxMargin;
  const pLeft = px + margin;
  const pRight = px + ps - margin;
  const pTop = py + margin;
  const pBottom = py + ps - margin;

  for (const obs of level.obstacles) {
    if (obs.type === 'spike') {
      const obsY = obs.onBlock
        ? groundY - obs.h - obs.blockH
        : groundY - obs.h;
      const spikeMargin = config.spikeMargin;
      const sLeft = obs.x + spikeMargin;
      const sRight = obs.x + obs.w - spikeMargin;
      const sTop = obsY + spikeMargin;
      const sBottom = obsY + obs.h;
      if (pRight > sLeft && pLeft < sRight && pBottom > sTop && pTop < sBottom) {
        return true;
      }
    } else if (obs.type === 'block') {
      const bTop = groundY - obs.h;
      if (pRight > obs.x && pLeft < obs.x + obs.w && pBottom > bTop && pTop < bTop + obs.h) {
        const prevBottom = pBottom - player.vy;
        if (prevBottom <= bTop + 5 && player.vy >= 0) {
          player.y = bTop - ps;
          player.vy = 0;
          player.grounded = true;
          return false;
        }
        return true;
      }
    } else if (obs.type === 'gap') {
      if (px + ps > obs.x && px < obs.x + obs.w && py + ps >= groundY) {
        return true;
      }
    }
  }
  return false;
}

// ===== DRAWING =====
function drawPlayer() {
  const sx = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  const sy = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;

  ctx.save();
  ctx.translate(player.x + PLAYER_SIZE / 2 + sx, player.y + PLAYER_SIZE / 2 + sy);
  ctx.rotate(player.rotation);

  ctx.shadowColor = player.color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = player.color;
  ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(-PLAYER_SIZE / 2 + 6, -PLAYER_SIZE / 2 + 6, PLAYER_SIZE - 12, PLAYER_SIZE - 12);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(-4, -8, 8, 8);
  ctx.fillStyle = 'white';
  ctx.fillRect(-2, -6, 4, 4);

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawObstacles() {
  for (const obs of level.obstacles) {
    const screenX = obs.x - cameraX;
    if (screenX > canvas.width + 100 || screenX < -100) continue;

    if (obs.type === 'spike') {
      const obsY = obs.onBlock
        ? groundY - obs.h - obs.blockH
        : groundY - obs.h;

      ctx.save();
      ctx.shadowColor = '#ff0044';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff0044';
      ctx.beginPath();
      ctx.moveTo(screenX + obs.w / 2, obsY);
      ctx.lineTo(screenX, obsY + obs.h);
      ctx.lineTo(screenX + obs.w, obsY + obs.h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(screenX + obs.w / 2, obsY + 10);
      ctx.lineTo(screenX + 8, obsY + obs.h - 2);
      ctx.lineTo(screenX + obs.w - 8, obsY + obs.h - 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    } else if (obs.type === 'block') {
      const bTop = groundY - obs.h;
      ctx.save();
      ctx.shadowColor = '#8800ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#330066';
      ctx.fillRect(screenX, bTop, obs.w, obs.h);
      ctx.strokeStyle = '#8800ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, bTop, obs.w, obs.h);
      ctx.fillStyle = 'rgba(136,0,255,0.2)';
      ctx.fillRect(screenX + 4, bTop + 4, obs.w - 8, obs.h - 8);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else if (obs.type === 'gap') {
      ctx.fillStyle = '#000';
      ctx.fillRect(screenX, groundY, obs.w, canvas.height - groundY);
      ctx.strokeStyle = 'rgba(255,0,68,0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < obs.w; i += 15) {
        ctx.beginPath();
        ctx.moveTo(screenX + i, groundY);
        ctx.lineTo(screenX + i + 15, groundY + 30);
        ctx.stroke();
      }
    }
  }
}

// ===== GAME LOGIC =====
function jump() {
  if (!player.alive) return;
  if (player.grounded) {
    player.vy = config.jumpForce;
    player.grounded = false;
    playJumpSound();
    spawnParticles(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE, player.color, 6, 3);
  }
}

function die() {
  if (!player.alive) return;
  player.alive = false;
  deathFreezeFrames = 15;
  screenShake = 12;
  playDeathSound();
  playCrashSound();
  spawnParticles(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, '#ff0044', 30, 6);
  spawnParticles(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, '#ffff00', 15, 4);
  spawnParticles(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, '#ffffff', 10, 8);

  const percent = Math.min(Math.floor((cameraX / level.totalLength) * 100), 100);
  saveBest(percent);

  setTimeout(() => {
    if (gameState === 'playing') {
      gameState = 'dead';
      stopBeat();
      document.getElementById('scoreText').textContent = percent + '%';
      document.getElementById('bestText').textContent = 'Bester: ' + getBest() + '%';
      document.getElementById('deathScreen').style.display = 'block';
      document.getElementById('hud').style.display = 'none';
    }
  }, 600);
}

function update() {
  if (gameState !== 'playing') return;

  if (deathFreezeFrames > 0) {
    deathFreezeFrames--;
    screenShake *= 0.85;
    updateParticles();
    return;
  }

  if (!player.alive) {
    updateParticles();
    return;
  }

  frameCount++;

  const progress = cameraX / level.totalLength;
  gameSpeed = config.speedBase + (config.speedMax - config.speedBase) * progress;
  cameraX += gameSpeed;

  // Win
  if (cameraX >= level.totalLength) {
    gameState = 'win';
    saveBest(100);
    stopBeat();
    document.getElementById('deathScreen').style.display = 'block';
    document.getElementById('deathScreen').querySelector('h2').textContent = 'GESCHAFFT!';
    document.getElementById('deathScreen').querySelector('h2').style.color = '#00ff88';
    document.getElementById('scoreText').textContent = '100%';
    document.getElementById('bestText').textContent = 'Level komplett!';
    document.getElementById('hud').style.display = 'none';
    spawnParticles(canvas.width / 2, canvas.height / 2, '#00ff88', 50, 8);
    spawnParticles(canvas.width / 2, canvas.height / 2, '#ffff00', 30, 6);
    return;
  }

  // Physics
  if (!player.grounded) {
    player.vy += config.gravity;
    player.rotation += 0.08;
  } else {
    const target = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
    player.rotation += (target - player.rotation) * 0.3;
  }

  player.y += player.vy;

  // Ground check
  let overGap = false;
  for (const obs of level.obstacles) {
    if (obs.type === 'gap') {
      const px = player.x + cameraX;
      if (px + PLAYER_SIZE > obs.x && px < obs.x + obs.w) {
        overGap = true;
        break;
      }
    }
  }

  if (!overGap && player.y + PLAYER_SIZE >= groundY) {
    player.y = groundY - PLAYER_SIZE;
    player.vy = 0;
    player.grounded = true;
  } else if (overGap && player.y > canvas.height + 100) {
    die();
    return;
  }

  if (!overGap && player.y + PLAYER_SIZE < groundY) {
    player.grounded = false;
  }

  if (checkCollision()) {
    die();
    return;
  }

  if (frameCount % 2 === 0) {
    spawnTrail(player.x, player.y + PLAYER_SIZE);
  }

  const percent = Math.min(Math.floor(progress * 100), 100);
  document.getElementById('progressBar').style.width = percent + '%';
  document.getElementById('percentText').textContent = percent + '%';

  updateParticles();
  if (screenShake > 0) screenShake *= 0.9;
}

function draw() {
  groundY = canvas.height * GROUND_Y_RATIO;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(cameraX);
  drawGround(cameraX);

  if (gameState === 'playing' || gameState === 'dead') {
    drawObstacles();
    drawParticles();
    if (player.alive || deathFreezeFrames > 0) {
      drawPlayer();
    }
  }
  if (gameState === 'win') {
    drawParticles();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== INPUT =====
function onInputDown(e) {
  e.preventDefault();
  ensureAudio();
  inputDown = true;
  if (gameState === 'playing') jump();
}

function onInputUp(e) {
  e.preventDefault();
  inputDown = false;
}

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    ensureAudio();
    if (gameState === 'playing') jump();
    if (gameState === 'dead' || gameState === 'win') retry();
  }
});

canvas.addEventListener('mousedown', onInputDown);
canvas.addEventListener('mouseup', onInputUp);
canvas.addEventListener('touchstart', onInputDown, { passive: false });
canvas.addEventListener('touchend', onInputUp, { passive: false });

// ===== DIFFICULTY UI =====
function setDifficulty(diff) {
  currentDifficulty = diff;
  config = DIFFICULTY_CONFIGS[diff];
  localStorage.setItem('ryozodash_difficulty', diff);

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.diff === diff);
  });

  // Update best display
  const bestDisplay = document.getElementById('bestDisplay');
  if (bestDisplay) {
    const best = getBest();
    bestDisplay.textContent = best > 0 ? 'Bester: ' + best + '%' : '';
  }
}

// ===== UI =====
function startGame() {
  ensureAudio();
  colorIndex = colorIndex % PLAYER_COLORS.length;
  initGame();
  gameState = 'playing';
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('deathScreen').style.display = 'none';
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('attemptText').textContent = 'Versuch ' + attempt;
  document.getElementById('progressBar').style.width = '0%';
  startBeat();
}

function retry() {
  attempt++;
  colorIndex = (colorIndex + 1) % PLAYER_COLORS.length;
  document.getElementById('deathScreen').querySelector('h2').textContent = 'CRASH!';
  document.getElementById('deathScreen').querySelector('h2').style.color = '#ff4444';
  startGame();
}

document.getElementById('playBtn').addEventListener('click', startGame);
document.getElementById('retryBtn').addEventListener('click', retry);

// Init difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
});

// Set initial difficulty
setDifficulty(currentDifficulty);

// ===== INIT =====
initGame();
gameLoop();

})();
