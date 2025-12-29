/**
 * ===============================================
 * 🎨 PARTICLE & RENDERING SYSTEM
 * ===============================================
 */

// Canvas Setup
let canvas, ctx;
let canvasWidth, canvasHeight;

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;
    
    const gridWidth = CONFIG.COLS * CONFIG.TILE_SIZE;
    const gridHeight = CONFIG.ROWS * CONFIG.TILE_SIZE;
    
    const scale = Math.min(1, Math.min(maxWidth / gridWidth, maxHeight / gridHeight));
    
    canvasWidth = gridWidth;
    canvasHeight = gridHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${gridWidth * scale}px`;
    canvas.style.height = `${gridHeight * scale}px`;
}

// Main Render Function
function render() {
    // Clear
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Grid
    renderGrid();
    
    // Path markers
    renderPathMarkers();
    
    // Effects (under)
    renderEffectsUnder();
    
    // Towers
    renderTowers();
    
    // Enemies
    renderEnemies();
    
    // Projectiles
    renderProjectiles();
    
    // Particles
    renderParticles();
    
    // Effects (over)
    renderEffectsOver();
    
    // Selection highlight
    renderSelection();
}

// Grid Rendering
function renderGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 159, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let c = 0; c <= CONFIG.COLS; c++) {
        const x = c * CONFIG.TILE_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let r = 0; r <= CONFIG.ROWS; r++) {
        const y = r * CONFIG.TILE_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

function renderPathMarkers() {
    // Start (green)
    const startPos = Grid.toWorld(PATH_START.c, PATH_START.r);
    ctx.fillStyle = 'rgba(0, 255, 100, 0.25)';
    ctx.fillRect(
        PATH_START.c * CONFIG.TILE_SIZE,
        PATH_START.r * CONFIG.TILE_SIZE,
        CONFIG.TILE_SIZE,
        CONFIG.TILE_SIZE
    );
    
    // End (red)
    ctx.fillStyle = 'rgba(255, 0, 100, 0.25)';
    ctx.fillRect(
        PATH_END.c * CONFIG.TILE_SIZE,
        PATH_END.r * CONFIG.TILE_SIZE,
        CONFIG.TILE_SIZE,
        CONFIG.TILE_SIZE
    );
}

// Tower Rendering
function renderTowers() {
    for (const tower of entities.towers) {
        const tileX = tower.c * CONFIG.TILE_SIZE;
        const tileY = tower.r * CONFIG.TILE_SIZE;
        
        // Base
        const padding = 4;
        ctx.fillStyle = tower.color;
        ctx.fillRect(
            tileX + padding,
            tileY + padding,
            CONFIG.TILE_SIZE - padding * 2,
            CONFIG.TILE_SIZE - padding * 2
        );
        
        // Glow if shooting
        if (tower.shootFlash > 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = tower.color;
        }
        
        // Turret
        ctx.save();
        ctx.translate(tower.x, tower.y);
        ctx.rotate(tower.angle);
        
        ctx.fillStyle = '#222';
        ctx.fillRect(-12, -4, 20, 8);
        
        ctx.restore();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Icon
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tower.icon, tower.x, tower.y);
        
        // Level indicator
        if (tower.level > 1) {
            ctx.font = 'bold 12px Orbitron';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(tower.level, tower.x + 12, tower.y - 12);
            ctx.fillText(tower.level, tower.x + 12, tower.y - 12);
        }
    }
}

// Enemy Rendering
function renderEnemies() {
    for (const enemy of entities.enemies) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + enemy.size, enemy.size * 0.8, enemy.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body with wobble
        const wobbleX = Math.sin(enemy.wobble) * 2;
        const wobbleY = Math.sin(enemy.walkCycle) * 3;
        
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = enemy.color;
        
        ctx.beginPath();
        ctx.arc(enemy.x + wobbleX, enemy.y + wobbleY, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Health bar
        const hpPercent = enemy.getHealthPercent();
        const barWidth = enemy.size * 2;
        const barHeight = 4;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.size - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }
}

// Projectile Rendering
function renderProjectiles() {
    for (const p of entities.projectiles) {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Trail
        if (p.isArea) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// Particle Rendering
function renderParticles() {
    for (const p of entities.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
}

// Effects Rendering
function renderEffectsUnder() {
    for (const effect of entities.effects) {
        if (effect.type === 'explosion-ring') {
            const progress = 1 - (effect.life / effect.maxLife);
            effect.radius = effect.maxRadius * progress;
            
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = effect.life / effect.maxLife;
            
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
    }
}

function renderEffectsOver() {
    for (const effect of entities.effects) {
        if (effect.type === 'wave-complete') {
            const alpha = effect.life / 120;
            const y = canvasHeight / 2 - (1 - alpha) * 50;
            
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 36px Orbitron';
            ctx.fillStyle = '#00ff9f';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ff9f';
            
            ctx.fillText(`ONDA ${effect.wave} COMPLETA!`, canvasWidth / 2, y);
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }
}

// Selection Rendering
function renderSelection() {
    // Preview de placement (arrastar ou click-to-place)
    if (typeof previewTower !== 'undefined' && previewTower) {
        const tileX = previewTower.c * CONFIG.TILE_SIZE;
        const tileY = previewTower.r * CONFIG.TILE_SIZE;
        
        // Cor baseada em validade
        if (previewTower.valid) {
            ctx.fillStyle = 'rgba(0, 255, 159, 0.3)';
            ctx.strokeStyle = '#00ff9f';
        } else {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.strokeStyle = '#ff0000';
        }
        
        ctx.lineWidth = 3;
        ctx.fillRect(tileX, tileY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        ctx.strokeRect(tileX + 2, tileY + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
        
        // Show tower icon preview
        if (GameState.selectedTowerType && TOWER_TYPES[GameState.selectedTowerType]) {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.7;
            ctx.fillText(
                TOWER_TYPES[GameState.selectedTowerType].icon,
                tileX + CONFIG.TILE_SIZE / 2,
                tileY + CONFIG.TILE_SIZE / 2
            );
            ctx.globalAlpha = 1;
        }
    }
    
    // Selected tower (for upgrade)
    if (!GameState.selectedTower) return;
    
    const tower = GameState.selectedTower;
    
    // Range circle
    ctx.strokeStyle = 'rgba(0, 255, 159, 0.3)';
    ctx.fillStyle = 'rgba(0, 255, 159, 0.05)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Tile highlight
    ctx.strokeStyle = '#00ff9f';
    ctx.lineWidth = 3;
    ctx.strokeRect(
        tower.c * CONFIG.TILE_SIZE + 2,
        tower.r * CONFIG.TILE_SIZE + 2,
        CONFIG.TILE_SIZE - 4,
        CONFIG.TILE_SIZE - 4
    );
}

// Export
window.initCanvas = initCanvas;
window.render = render;
