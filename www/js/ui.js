/**
 * ===============================================
 * 🎮 UI CONTROLS & INTERACTIONS
 * ===============================================
 */

// UI State
let hoveredTile = null;

// Initialize UI
function initUI() {
    // Canvas click events
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', updatePlacementPreviewMouse);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Tower selection
    document.querySelectorAll('.tower-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            selectTowerType(type);
        });
    });
    
    // Restore grid size selection
    const savedGridSize = localStorage.getItem('zombieTD_gridSize') || 'large';
    console.log('Loading saved grid size:', savedGridSize);
    
    // Update UI to reflect saved selection
    document.querySelectorAll('.grid-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    const savedOption = document.querySelector(`[data-size="${savedGridSize}"]`);
    if (savedOption) {
        savedOption.classList.add('active');
    }
    
    loadStats();
    updateMenuStats();
}

function updatePlacementPreviewMouse(e) {
    if (!placementMode || !GameState.selectedTowerType) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const gridPos = Grid.toGrid(x, y);
    updatePlacementPreview(gridPos.c, gridPos.r);
}

// HUD Updates
function updateHUD() {
    document.getElementById('lives').textContent = GameState.lives;
    document.getElementById('money').textContent = GameState.money;
    document.getElementById('wave-number').textContent = GameState.wave;
    document.getElementById('score').textContent = GameState.score;
    document.getElementById('next-wave-num').textContent = GameState.wave;
    
    // Update tower card affordability
    updateTowerCards();
}

function updateTowerCards() {
    document.querySelectorAll('.tower-card').forEach(card => {
        const type = card.dataset.type;
        const cost = TOWER_TYPES[type].cost;
        
        if (GameState.money >= cost) {
            card.style.opacity = '1';
            card.style.pointerEvents = 'all';
        } else {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        }
    });
}

function updateMenuStats() {
    document.getElementById('menu-best-wave').textContent = GameState.bestWave;
    document.getElementById('menu-total-kills').textContent = GameState.totalKills;
}

// Tower Selection
let placementMode = false; // Click-to-place mode
let draggedTower = null; // Drag & drop state
let previewTower = null; // Visual preview

function selectTowerType(type) {
    GameState.selectedTowerType = type;
    GameState.selectedTower = null;
    placementMode = true; // Ativa modo de colocação
    closeUpgradePanel();
    
    // Visual feedback
    document.querySelectorAll('.tower-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelector(`[data-type="${type}"]`)?.classList.add('selected');
    
    // Play sound
    AudioManager.playSFX('button');
    
    // Show instruction
    showPlacementHint();
}

function showPlacementHint() {
    const hint = document.createElement('div');
    hint.id = 'placement-hint';
    hint.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 255, 159, 0.9);
        color: #000;
        padding: 10px 20px;
        border-radius: 20px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 2s ease forwards;
    `;
    hint.textContent = '👆 Toque no grid para posicionar';
    document.body.appendChild(hint);
    
    setTimeout(() => hint.remove(), 2000);
}

// Canvas Interactions (Touch + Mouse)
function handleCanvasClick(e) {
    if (!GameState.isRunning || GameState.isPaused) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const gridPos = Grid.toGrid(x, y);
    
    handleGridClick(gridPos.c, gridPos.r);
}

// Touch Handlers (Mobile-optimized)
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touched existing tower
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    const gridPos = Grid.toGrid(canvasX, canvasY);
    const existingTower = entities.towers.find(t => t.c === gridPos.c && t.r === gridPos.r);
    
    if (existingTower && !placementMode) {
        // Select tower for upgrade
        selectTower(existingTower);
    } else if (placementMode && GameState.selectedTowerType) {
        // Preview placement
        updatePlacementPreview(gridPos.c, gridPos.r);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (!placementMode || !GameState.selectedTowerType) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    const gridPos = Grid.toGrid(x, y);
    updatePlacementPreview(gridPos.c, gridPos.r);
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    if (!placementMode || !GameState.selectedTowerType || !previewTower) return;
    
    // Place tower at preview position
    const success = placeTower(previewTower.c, previewTower.r, GameState.selectedTowerType);
    
    if (success) {
        // Keep placement mode active for multiple placements
        // User can click another tower type or click elsewhere to cancel
    }
    
    previewTower = null;
}

function updatePlacementPreview(c, r) {
    previewTower = {
        c, r,
        valid: canPlaceTower(c, r)
    };
}

function handleGridClick(c, r) {
    // Check if clicked on existing tower
    const existingTower = entities.towers.find(t => t.c === c && t.r === r);
    
    if (existingTower && !placementMode) {
        // Select tower for upgrade/sell
        selectTower(existingTower);
        return;
    }
    
    // Placement mode
    if (placementMode && GameState.selectedTowerType) {
        const success = placeTower(c, r, GameState.selectedTowerType);
        
        if (success) {
            // Keep placement mode active
            // Visual feedback done by placeTower
        }
        return;
    }
    
    // Cancel placement mode if clicked elsewhere
    if (placementMode && !GameState.selectedTowerType) {
        cancelPlacementMode();
    }
}

function cancelPlacementMode() {
    placementMode = false;
    GameState.selectedTowerType = null;
    previewTower = null;
    
    document.querySelectorAll('.tower-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// Tower Selection & Upgrade Panel
function selectTower(tower) {
    GameState.selectedTower = tower;
    GameState.selectedTowerType = null;
    
    // Deselect UI selection
    document.querySelectorAll('.tower-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    showUpgradePanel(tower);
}

function showUpgradePanel(tower) {
    const panel = document.getElementById('upgrade-panel');
    const def = TOWER_TYPES[tower.type];
    
    panel.style.display = 'block';
    
    document.getElementById('upgrade-tower-name').textContent = def.name.toUpperCase();
    document.getElementById('upgrade-level').textContent = tower.level;
    document.getElementById('upgrade-damage').textContent = tower.damage;
    document.getElementById('upgrade-range').textContent = tower.range;
    document.getElementById('upgrade-speed').textContent = (1 / tower.fireRate).toFixed(2) + 'x';
    
    const upgradeCost = tower.getUpgradeCost();
    const sellCost = tower.getSellValue();
    
    document.getElementById('upgrade-cost').textContent = upgradeCost;
    document.getElementById('sell-cost').textContent = sellCost;
    
    // Enable/disable upgrade button
    const upgradeBtn = document.getElementById('btn-upgrade');
    if (GameState.money >= upgradeCost) {
        upgradeBtn.disabled = false;
    } else {
        upgradeBtn.disabled = true;
    }
}

function closeUpgradePanel() {
    document.getElementById('upgrade-panel').style.display = 'none';
    GameState.selectedTower = null;
}

function upgradeTower() {
    if (GameState.selectedTower) {
        const success = GameState.selectedTower.upgrade();
        if (success) {
            showUpgradePanel(GameState.selectedTower);
        }
    }
}

function sellTower() {
    if (GameState.selectedTower) {
        sellTower(GameState.selectedTower);
        closeUpgradePanel();
    }
}

// Wave Controls
function startNextWave() {
    startWave();
}

function disableWaveButton() {
    const btn = document.getElementById('start-wave-btn');
    btn.disabled = true;
    btn.textContent = 'ONDA EM PROGRESSO...';
}

function enableWaveButton() {
    const btn = document.getElementById('start-wave-btn');
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-icon">⚔️</span> INICIAR ONDA ${GameState.wave}`;
}

// Messages
function showMessage(title, message) {
    // Quick toast-style message
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(20, 25, 45, 0.95);
        border: 2px solid #ff006e;
        border-radius: 8px;
        padding: 15px 30px;
        z-index: 9999;
        animation: slideDown 0.3s ease;
    `;
    toast.innerHTML = `
        <strong style="color: #ff006e;">${title}</strong><br>
        <span style="color: #a0aec0;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function hideMessage() {
    // Implemented via toast system
}

// Game Over Screen
function showGameOverScreen() {
    const overlay = document.getElementById('game-overlay');
    overlay.style.display = 'flex';
    
    document.getElementById('overlay-title').textContent = 'GAME OVER';
    document.getElementById('final-wave').textContent = GameState.wave;
    document.getElementById('final-score').textContent = GameState.score;
}

function hideGameOverScreen() {
    document.getElementById('game-overlay').style.display = 'none';
}

// Screen Navigation
function startGame() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    
    resetGameState();
    initCanvas();
    
    GameState.isRunning = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    hideGameOverScreen();
    resetGameState();
}

function backToMenu() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    
    GameState.isRunning = false;
    updateMenuStats();
}

// Tutorial
function showTutorial() {
    document.getElementById('tutorial-modal').style.display = 'flex';
}

function closeTutorial() {
    document.getElementById('tutorial-modal').style.display = 'none';
}

// Leaderboard
function showLeaderboard() {
    document.getElementById('leaderboard-modal').style.display = 'flex';
    
    document.getElementById('lb-best-wave').textContent = GameState.bestWave;
    document.getElementById('lb-best-score').textContent = GameState.bestScore;
    document.getElementById('lb-total-kills').textContent = GameState.totalKills;
}

function closeLeaderboard() {
    document.getElementById('leaderboard-modal').style.display = 'none';
}

// Grid Size Selection
function selectGridSize(size) {
    console.log('Selecting grid size:', size);
    
    // Update grid configuration
    setGridSize(size);
    
    // Reinitialize grid data structure
    Grid.init();
    
    // Update UI
    document.querySelectorAll('.grid-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`[data-size="${size}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Play sound
    if (typeof AudioManager !== 'undefined') {
        AudioManager.playSFX('button');
    }
    
    // Show feedback
    const gridName = GRID_PRESETS[size]?.name || size;
    showMessage('Grid Atualizado', `Campo ${gridName} (${GRID_PRESETS[size].cols}x${GRID_PRESETS[size].rows}) selecionado!`);
}

// Power-ups
function usePowerUp(type) {
    const success = PowerUpManager.use(type);
    
    if (success) {
        updatePowerUpUI();
    } else {
        // Feedback de erro
        AudioManager.playSFX('hit');
    }
}

function updatePowerUpUI() {
    // Update all power-up cards
    Object.keys(POWERUPS).forEach(type => {
        const card = document.querySelector(`[data-type="${type}"]`);
        if (!card) return;
        
        const canUse = PowerUpManager.canUse(type);
        
        if (canUse) {
            card.classList.remove('disabled');
        } else {
            card.classList.add('disabled');
        }
        
        // Update cooldown bar
        const cooldownBar = document.getElementById(`cooldown-${type}`);
        if (cooldownBar) {
            const percent = PowerUpManager.getCooldownPercent(type);
            cooldownBar.style.transform = `scaleX(${percent})`;
        }
    });
}

// Call updatePowerUpUI on every frame
const originalUpdateHUD = updateHUD;
updateHUD = function() {
    originalUpdateHUD();
    updatePowerUpUI();
};

// Integrate sounds into existing functions
const originalPlaceTower = window.placeTower;
window.placeTower = function(...args) {
    const result = originalPlaceTower(...args);
    if (result) {
        AudioManager.playSFX('build');
    }
    return result;
};

const originalUpgradeTower = upgradeTower;
upgradeTower = function() {
    const tower = GameState.selectedTower;
    if (tower) {
        const success = tower.upgrade();
        if (success) {
            AudioManager.playSFX('upgrade');
            showUpgradePanel(GameState.selectedTower);
        }
    }
};

const originalSellTower = sellTower;
sellTower = function() {
    if (GameState.selectedTower) {
        window.sellTower(GameState.selectedTower);
        AudioManager.playSFX('sell');
        closeUpgradePanel();
    }
};

const originalStartNextWave = startNextWave;
startNextWave = function() {
    originalStartNextWave();
    AudioManager.playSFX('wave-start');
};

// Export
window.initUI = initUI;
window.updateHUD = updateHUD;
window.selectTowerType = selectTowerType;
window.closeUpgradePanel = closeUpgradePanel;
window.upgradeTower = upgradeTower;
window.sellTower = sellTower;
window.startNextWave = startNextWave;
window.startGame = startGame;
window.resetGame = resetGame;
window.backToMenu = backToMenu;
window.showTutorial = showTutorial;
window.closeTutorial = closeTutorial;
window.showLeaderboard = showLeaderboard;
window.closeLeaderboard = closeLeaderboard;
window.showMessage = showMessage;
window.usePowerUp = usePowerUp;
window.updatePowerUpUI = updatePowerUpUI;
window.selectGridSize = selectGridSize;
window.cancelPlacementMode = cancelPlacementMode;
