/**
 * ===============================================
 * 🎮 ZOMBIE DEFENSE - GAME ENGINE CORE
 * ===============================================
 */

// Game Configuration
const CONFIG = {
  TILE_SIZE: 40,
  COLS: 20,
  ROWS: 12,
  FPS: 60,

  // Game Balance
  STARTING_MONEY: 150,
  STARTING_LIVES: 20,

  // Wave Scaling
  WAVE_BASE_ENEMIES: 5,
  WAVE_SCALING: 1.5,
  SPAWN_INTERVAL: 40, // frames

  // Rewards
  WAVE_BONUS: 20,
  WAVE_BONUS_SCALING: 2,
};

// Grid Presets
const GRID_PRESETS = {
  medium: {
    name: 'Médio',
    cols: 15,
    rows: 10,
    icon: '📱',
    description: 'Melhor para celulares'
  },
  large: {
    name: 'Grande',
    cols: 20,
    rows: 12,
    icon: '📲',
    description: 'Equilíbrio perfeito'
  },
  huge: {
    name: 'Enorme',
    cols: 25,
    rows: 15,
    icon: '🖥️',
    description: 'Máximo desafio'
  }
};

// Current grid size (loaded from localStorage or default)
let currentGridSize = localStorage.getItem('zombieTD_gridSize') || 'large';

function setGridSize(size) {
  if (GRID_PRESETS[size]) {
    currentGridSize = size;
    CONFIG.COLS = GRID_PRESETS[size].cols;
    CONFIG.ROWS = GRID_PRESETS[size].rows;
    localStorage.setItem('zombieTD_gridSize', size);
    
    // Update path positions
    PATH_START.r = Math.floor(CONFIG.ROWS / 2);
    PATH_END.c = CONFIG.COLS - 1;
    PATH_END.r = Math.floor(CONFIG.ROWS / 2);
  }
}

// Apply saved grid size
setGridSize(currentGridSize);

// Game State
const GameState = {
  // Resources
  money: CONFIG.STARTING_MONEY,
  lives: CONFIG.STARTING_LIVES,
  score: 0,
  wave: 1,

  // Status
  isRunning: false,
  isPaused: false,
  isGameOver: false,
  waveActive: false,

  // Wave Control
  enemiesToSpawn: 0,
  spawnTimer: 0,
  enemiesAlive: 0,

  // Selection
  selectedTowerType: null,
  selectedTower: null,

  // Statistics
  totalKills: 0,
  bestWave: 0,
  bestScore: 0,
};

// Grid System
const Grid = {
  data: [],

  init() {
    this.data = Array(CONFIG.COLS)
      .fill(0)
      .map(() => Array(CONFIG.ROWS).fill(0));
  },

  get(c, r) {
    if (c < 0 || c >= CONFIG.COLS || r < 0 || r >= CONFIG.ROWS) return 1;
    return this.data[c][r];
  },

  set(c, r, value) {
    if (c >= 0 && c < CONFIG.COLS && r >= 0 && r < CONFIG.ROWS) {
      this.data[c][r] = value;
    }
  },

  toWorld(c, r) {
    return {
      x: c * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
      y: r * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
    };
  },

  toGrid(x, y) {
    return {
      c: Math.floor(x / CONFIG.TILE_SIZE),
      r: Math.floor(y / CONFIG.TILE_SIZE),
    };
  },
};

// Path Points
const PATH_START = { c: 0, r: Math.floor(CONFIG.ROWS / 2) };
const PATH_END = { c: CONFIG.COLS - 1, r: Math.floor(CONFIG.ROWS / 2) };

// Entity Arrays
const entities = {
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],
  effects: [],
};

// Money & Lives Management
function addMoney(amount) {
  GameState.money += amount;
  updateHUD();

  // Flash effect
  const moneyEl = document.getElementById("money");
  moneyEl.style.transform = "scale(1.2)";
  setTimeout(() => (moneyEl.style.transform = "scale(1)"), 200);
}

function removeMoney(amount) {
  if (GameState.money >= amount) {
    GameState.money -= amount;
    updateHUD();
    return true;
  }
  return false;
}

function loseLife() {
  GameState.lives--;
  updateHUD();

  // Screen shake effect
  const canvas = document.getElementById("gameCanvas");
  canvas.style.animation = "shake 0.5s ease";
  setTimeout(() => (canvas.style.animation = ""), 500);

  // Sound
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playSFX('lose-life');
  }

  if (GameState.lives <= 0) {
    gameOver();
  }
}

function addScore(points) {
  GameState.score += points;
  updateHUD();
}

// Game Loop
let lastTime = 0;
let deltaTime = 0;

function gameLoop(currentTime) {
  if (!GameState.isRunning) return;

  deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (!GameState.isPaused) {
    update(deltaTime);
  }

  render();

  requestAnimationFrame(gameLoop);
}

// Update Logic
function update(dt) {
  // Wave Spawning
  if (GameState.waveActive && GameState.enemiesToSpawn > 0) {
    GameState.spawnTimer++;
    if (GameState.spawnTimer >= CONFIG.SPAWN_INTERVAL) {
      spawnEnemy();
      GameState.enemiesToSpawn--;
      GameState.spawnTimer = 0;
    }
  }

  // Check Wave Complete
  if (
    GameState.waveActive &&
    GameState.enemiesToSpawn === 0 &&
    entities.enemies.length === 0
  ) {
    completeWave();
  }

  // Update Entities
  updateEnemies(dt);
  updateTowers(dt);
  updateProjectiles(dt);
  updateParticles(dt);
  updateEffects(dt);
}

// Spawn Enemy
function spawnEnemy() {
  const enemy = createEnemy(GameState.wave);
  if (enemy) {
    entities.enemies.push(enemy);
    GameState.enemiesAlive++;
  }
}

// Kill Enemy
function killEnemy(enemy) {
  const index = entities.enemies.indexOf(enemy);
  if (index > -1) {
    entities.enemies.splice(index, 1);

    // Rewards
    addMoney(enemy.reward);
    addScore(enemy.scoreValue);
    GameState.totalKills++;

    // Death particles
    createDeathParticles(enemy.x, enemy.y, enemy.color);

    // Update stats
    saveStats();
  }
}

// Enemy Reached End
function enemyReachedEnd(enemy) {
  const index = entities.enemies.indexOf(enemy);
  if (index > -1) {
    entities.enemies.splice(index, 1);
    loseLife();
  }
}

// Start Wave
function startWave() {
  if (GameState.waveActive) return;

  GameState.waveActive = true;
  GameState.enemiesToSpawn = Math.floor(
    CONFIG.WAVE_BASE_ENEMIES + GameState.wave * CONFIG.WAVE_SCALING
  );
  GameState.spawnTimer = 0;

  updateHUD();
  disableWaveButton();
}

// Complete Wave
function completeWave() {
  GameState.waveActive = false;
  GameState.wave++;

  // Wave Bonus
  const bonus = CONFIG.WAVE_BONUS + GameState.wave * CONFIG.WAVE_BONUS_SCALING;
  addMoney(bonus);

  // Update best wave
  if (GameState.wave > GameState.bestWave) {
    GameState.bestWave = GameState.wave;
    saveStats();
  }

  updateHUD();
  enableWaveButton();

  // Visual feedback
  showWaveCompleteEffect();
  
  // Sound
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playSFX('wave-complete');
  }
}

// Game Over
function gameOver() {
  GameState.isGameOver = true;
  GameState.isRunning = false;

  // Update best score
  if (GameState.score > GameState.bestScore) {
    GameState.bestScore = GameState.score;
    saveStats();
  }

  showGameOverScreen();
  
  // Sound
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playSFX('game-over');
    AudioManager.stopMusic();
  }
}

// Reset Game
function resetGameState() {
  GameState.money = CONFIG.STARTING_MONEY;
  GameState.lives = CONFIG.STARTING_LIVES;
  GameState.score = 0;
  GameState.wave = 1;
  GameState.isRunning = true;
  GameState.isPaused = false;
  GameState.isGameOver = false;
  GameState.waveActive = false;
  GameState.enemiesToSpawn = 0;
  GameState.spawnTimer = 0;
  GameState.selectedTowerType = null;
  GameState.selectedTower = null;

  Grid.init();

  entities.towers = [];
  entities.enemies = [];
  entities.projectiles = [];
  entities.particles = [];
  entities.effects = [];

  updateHUD();
}

// Toggle Pause
function togglePause() {
  GameState.isPaused = !GameState.isPaused;

  const pauseIcon = document.getElementById("pause-icon");
  pauseIcon.textContent = GameState.isPaused ? "▶" : "⏸";

  if (GameState.isPaused) {
    showMessage("PAUSADO", "Jogo pausado. Clique novamente para continuar.");
  } else {
    hideMessage();
  }
}

// Statistics
function loadStats() {
  const saved = localStorage.getItem("zombieDefense_stats");
  if (saved) {
    const stats = JSON.parse(saved);
    GameState.bestWave = stats.bestWave || 0;
    GameState.bestScore = stats.bestScore || 0;
    GameState.totalKills = stats.totalKills || 0;
  }
}

function saveStats() {
  const stats = {
    bestWave: GameState.bestWave,
    bestScore: GameState.bestScore,
    totalKills: GameState.totalKills,
  };
  localStorage.setItem("zombieDefense_stats", JSON.stringify(stats));
}

// Utility Functions
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

// Visual Effects
function createDeathParticles(x, y, color) {
  for (let i = 0; i < 15; i++) {
    entities.particles.push({
      x,
      y,
      vx: randomRange(-3, 3),
      vy: randomRange(-3, 3),
      life: 30,
      maxLife: 30,
      color: color,
      size: randomRange(3, 8),
      alpha: 1,
    });
  }
}

function createHitParticles(x, y, color) {
  for (let i = 0; i < 5; i++) {
    entities.particles.push({
      x,
      y,
      vx: randomRange(-2, 2),
      vy: randomRange(-2, 2),
      life: 15,
      maxLife: 15,
      color: color,
      size: randomRange(2, 5),
      alpha: 1,
    });
  }
}

function showWaveCompleteEffect() {
  entities.effects.push({
    type: "wave-complete",
    life: 120,
    wave: GameState.wave - 1,
  });
}

// Update Functions
function updateParticles(dt) {
  for (let i = entities.particles.length - 1; i >= 0; i--) {
    const p = entities.particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // Gravity
    p.life--;

    p.alpha = p.life / p.maxLife;

    if (p.life <= 0) {
      entities.particles.splice(i, 1);
    }
  }
}

function updateEffects(dt) {
  for (let i = entities.effects.length - 1; i >= 0; i--) {
    const e = entities.effects[i];
    e.life--;

    if (e.life <= 0) {
      entities.effects.splice(i, 1);
    }
  }
}

// Export for other modules
window.GameState = GameState;
window.Grid = Grid;
window.CONFIG = CONFIG;
window.PATH_START = PATH_START;
window.PATH_END = PATH_END;
window.entities = entities;
window.addMoney = addMoney;
window.removeMoney = removeMoney;
window.loseLife = loseLife;
window.addScore = addScore;
window.killEnemy = killEnemy;
window.enemyReachedEnd = enemyReachedEnd;
window.createDeathParticles = createDeathParticles;
window.createHitParticles = createHitParticles;
window.distance = distance;
window.lerp = lerp;
window.clamp = clamp;
window.randomRange = randomRange;
window.randomInt = randomInt;
window.gameLoop = gameLoop;
window.resetGameState = resetGameState;
window.togglePause = togglePause;
window.startWave = startWave;
window.loadStats = loadStats;
window.saveStats = saveStats;
window.GRID_PRESETS = GRID_PRESETS;
window.setGridSize = setGridSize;
