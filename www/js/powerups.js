/**
 * ===============================================
 * ⚡ POWER-UPS SYSTEM
 * ===============================================
 */

// Power-up Definitions
const POWERUPS = {
    slowmo: {
        name: 'Slow Motion',
        icon: '⏱️',
        cost: 100,
        duration: 10000, // ms
        description: 'Reduz velocidade dos zumbis em 50%',
        color: '#00b8ff',
    },
    nuke: {
        name: 'Bomba Nuclear',
        icon: '💣',
        cost: 200,
        description: 'Elimina todos os zumbis na tela',
        color: '#ff006e',
    },
    cash: {
        name: 'Chuva de Dinheiro',
        icon: '💰',
        cost: 50,
        amount: 150,
        description: 'Receba $150 instantaneamente',
        color: '#ffd700',
    },
    repair: {
        name: 'Kit Médico',
        icon: '❤️',
        cost: 150,
        amount: 5,
        description: 'Restaura 5 vidas',
        color: '#ff4444',
    },
};

// Power-up State
const PowerUpManager = {
    active: new Set(),
    cooldowns: new Map(),
    
    canUse(type) {
        const powerup = POWERUPS[type];
        if (!powerup) return false;
        
        // Check cooldown
        if (this.cooldowns.has(type)) {
            const cooldownEnd = this.cooldowns.get(type);
            if (Date.now() < cooldownEnd) return false;
        }
        
        // Check money
        if (GameState.money < powerup.cost) return false;
        
        return true;
    },
    
    use(type) {
        if (!this.canUse(type)) return false;
        
        const powerup = POWERUPS[type];
        
        // Deduct cost
        removeMoney(powerup.cost);
        
        // Execute effect
        switch(type) {
            case 'slowmo':
                this.activateSlowMotion();
                break;
            case 'nuke':
                this.activateNuke();
                break;
            case 'cash':
                this.activateCash();
                break;
            case 'repair':
                this.activateRepair();
                break;
        }
        
        // Set cooldown (30 seconds)
        this.cooldowns.set(type, Date.now() + 30000);
        
        // Visual feedback
        showPowerUpEffect(type);
        AudioManager.playSFX('upgrade');
        
        return true;
    },
    
    activateSlowMotion() {
        this.active.add('slowmo');
        
        // Slow all enemies
        entities.enemies.forEach(e => {
            e.originalSpeed = e.speed;
            e.speed *= 0.5;
        });
        
        // Deactivate after duration
        setTimeout(() => {
            this.active.delete('slowmo');
            entities.enemies.forEach(e => {
                if (e.originalSpeed) {
                    e.speed = e.originalSpeed;
                }
            });
        }, POWERUPS.slowmo.duration);
    },
    
    activateNuke() {
        // Kill all enemies
        const enemiesKilled = entities.enemies.length;
        
        entities.enemies.forEach(enemy => {
            killEnemy(enemy);
        });
        
        entities.enemies = [];
        
        // Massive explosion effect
        createNukeExplosion();
        AudioManager.playSFX('explosion');
        
        // Bonus for clearing
        if (enemiesKilled > 0) {
            addScore(enemiesKilled * 50);
        }
    },
    
    activateCash() {
        addMoney(POWERUPS.cash.amount);
        
        // Money rain particles
        for (let i = 0; i < 30; i++) {
            const x = randomRange(100, canvasWidth - 100);
            const y = -20;
            
            entities.particles.push({
                x, y,
                vx: randomRange(-1, 1),
                vy: randomRange(2, 5),
                life: 60,
                maxLife: 60,
                color: '#ffd700',
                size: 6,
                alpha: 1,
            });
        }
    },
    
    activateRepair() {
        GameState.lives = Math.min(GameState.lives + POWERUPS.repair.amount, CONFIG.STARTING_LIVES);
        updateHUD();
        
        // Healing particles
        createHealingEffect();
        AudioManager.playSFX('upgrade');
    },
    
    isActive(type) {
        return this.active.has(type);
    },
    
    getCooldownPercent(type) {
        if (!this.cooldowns.has(type)) return 0;
        
        const cooldownEnd = this.cooldowns.get(type);
        const remaining = cooldownEnd - Date.now();
        
        if (remaining <= 0) {
            this.cooldowns.delete(type);
            return 0;
        }
        
        return remaining / 30000;
    }
};

// Visual Effects
function showPowerUpEffect(type) {
    entities.effects.push({
        type: 'powerup-activation',
        powerup: type,
        life: 120,
        maxLife: 120,
    });
}

function createNukeExplosion() {
    // Screen flash
    entities.effects.push({
        type: 'screen-flash',
        life: 30,
        color: '#ff006e',
    });
    
    // Massive particles
    for (let i = 0; i < 100; i++) {
        entities.particles.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            vx: randomRange(-15, 15),
            vy: randomRange(-15, 15),
            life: randomInt(40, 80),
            maxLife: 80,
            color: i % 2 === 0 ? '#ff006e' : '#ffaa00',
            size: randomRange(6, 15),
            alpha: 1,
        });
    }
}

function createHealingEffect() {
    for (let i = 0; i < 20; i++) {
        entities.particles.push({
            x: randomRange(0, canvasWidth),
            y: canvasHeight,
            vx: randomRange(-2, 2),
            vy: randomRange(-8, -4),
            life: 60,
            maxLife: 60,
            color: '#44ff44',
            size: 8,
            alpha: 1,
        });
    }
}

/**
 * ===============================================
 * 🎮 GAME MODES
 * ===============================================
 */

const GameModes = {
    current: 'classic',
    
    modes: {
        classic: {
            name: 'Clássico',
            icon: '🎯',
            description: 'Modo tradicional com ondas crescentes',
            startMoney: 150,
            startLives: 20,
        },
        hardcore: {
            name: 'Hardcore',
            icon: '💀',
            description: 'Zumbis mais fortes, menos dinheiro',
            startMoney: 100,
            startLives: 10,
            enemyHpMultiplier: 1.5,
            enemySpeedMultiplier: 1.2,
            rewardMultiplier: 1.5,
        },
        endless: {
            name: 'Infinito',
            icon: '♾️',
            description: 'Ondas infinitas, sobreviva o máximo possível',
            startMoney: 200,
            startLives: 30,
            autoStartWaves: true,
        },
    },
    
    select(mode) {
        if (this.modes[mode]) {
            this.current = mode;
            localStorage.setItem('zombieTD_gameMode', mode);
        }
    },
    
    get() {
        return this.modes[this.current];
    },
    
    applyModifiers() {
        const mode = this.get();
        
        if (mode.enemyHpMultiplier) {
            // Apply to enemy creation (já considerado em createEnemy)
        }
        
        if (mode.autoStartWaves && !GameState.waveActive && entities.enemies.length === 0) {
            // Auto-start next wave after 3 seconds
            setTimeout(() => {
                if (GameState.isRunning && !GameState.waveActive) {
                    startWave();
                }
            }, 3000);
        }
    }
};

// Load saved mode
const savedMode = localStorage.getItem('zombieTD_gameMode');
if (savedMode && GameModes.modes[savedMode]) {
    GameModes.current = savedMode;
}

// Export
window.POWERUPS = POWERUPS;
window.PowerUpManager = PowerUpManager;
window.GameModes = GameModes;
window.showPowerUpEffect = showPowerUpEffect;
