/**
 * ===============================================
 * 🗼 TOWER SYSTEM
 * ===============================================
 */

// Tower Definitions
const TOWER_TYPES = {
    gatling: {
        name: 'GATLING',
        icon: '🔫',
        cost: 50,
        damage: 5,
        range: 120,
        fireRate: 10, // frames between shots
        projectileSpeed: 12,
        color: '#888',
        upgradeColor: '#00ff9f',
        upgradeCost: 1.5,
        description: 'Disparo rápido, dano médio',
    },
    tesla: {
        name: 'TESLA',
        icon: '⚡',
        cost: 100,
        damage: 15,
        range: 100,
        fireRate: 40,
        projectileSpeed: 15,
        areaRadius: 60,
        color: '#4488ff',
        upgradeColor: '#00b8ff',
        upgradeCost: 1.6,
        description: 'Ataque em área, alto dano',
    },
    sniper: {
        name: 'SNIPER',
        icon: '🎯',
        cost: 80,
        damage: 40,
        range: 200,
        fireRate: 60,
        projectileSpeed: 20,
        color: '#ff4444',
        upgradeColor: '#ff006e',
        upgradeCost: 1.7,
        description: 'Longo alcance, dano máximo',
    },
};

// Tower Class
class Tower {
    constructor(c, r, type) {
        this.c = c;
        this.r = r;
        const pos = Grid.toWorld(c, r);
        this.x = pos.x;
        this.y = pos.y;
        
        this.type = type;
        const def = TOWER_TYPES[type];
        
        this.level = 1;
        this.damage = def.damage;
        this.range = def.range;
        this.fireRate = def.fireRate;
        this.projectileSpeed = def.projectileSpeed;
        this.areaRadius = def.areaRadius || 0;
        this.color = def.color;
        this.icon = def.icon;
        
        this.cooldown = 0;
        this.target = null;
        this.angle = 0;
        
        // Animation
        this.shootFlash = 0;
        this.idleRotation = 0;
    }
    
    update(dt) {
        // Cooldown
        if (this.cooldown > 0) this.cooldown--;
        
        // Idle animation
        this.idleRotation += 0.01;
        
        // Shoot flash decay
        if (this.shootFlash > 0) this.shootFlash--;
        
        // Find target
        if (this.cooldown <= 0) {
            this.findTarget();
            
            if (this.target) {
                this.shoot();
                this.cooldownn = this.fireRate;
                this.shootFlash = 10;
            }
        }
        
        // Update angle towards target
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.angle = Math.atan2(dy, dx);
        }
    }
    
    findTarget() {
        let closest = null;
        let minDist = Infinity;
        
        for (const enemy of entities.enemies) {
            const dist = distance(this.x, this.y, enemy.x, enemy.y);
            
            if (dist <= this.range && dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }
        
        this.target = closest;
    }
    
    shoot() {
        if (!this.target) return;
        
        const projectile = {
            x: this.x,
            y: this.y,
            target: this.target,
            speed: this.projectileSpeed,
            damage: this.damage,
            color: this.level > 1 ? TOWER_TYPES[this.type].upgradeColor : '#fff',
            tower: this,
            isArea: this.areaRadius > 0,
            areaRadius: this.areaRadius,
        };
        
        entities.projectiles.push(projectile);
        
        // Sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playSFX('shoot');
        }
        
        // Muzzle flash particles
        for (let i = 0; i < 3; i++) {
            const angle = this.angle + randomRange(-0.2, 0.2);
            entities.particles.push({
                x: this.x + Math.cos(angle) * 15,
                y: this.y + Math.sin(angle) * 15,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                life: 8,
                maxLife: 8,
                color: '#ffaa00',
                size: 4,
                alpha: 1,
            });
        }
    }
    
    upgrade() {
        const def = TOWER_TYPES[this.type];
        const cost = Math.floor(def.cost * Math.pow(def.upgradeCost, this.level));
        
        if (removeMoney(cost)) {
            this.level++;
            this.damage += Math.floor(def.damage * 0.5 * this.level);
            this.range += 15;
            this.fireRate = Math.max(5, this.fireRate - 2);
            this.color = def.upgradeColor;
            
            // Upgrade effect
            createUpgradeEffect(this.x, this.y);
            return true;
        }
        
        return false;
    }
    
    getSellValue() {
        const def = TOWER_TYPES[this.type];
        let total = def.cost;
        
        for (let i = 1; i < this.level; i++) {
            total += Math.floor(def.cost * Math.pow(def.upgradeCost, i));
        }
        
        return Math.floor(total * 0.7);
    }
    
    getUpgradeCost() {
        const def = TOWER_TYPES[this.type];
        return Math.floor(def.cost * Math.pow(def.upgradeCost, this.level));
    }
}

// Tower Placement
function canPlaceTower(c, r) {
    // Check bounds
    if (c < 0 || c >= CONFIG.COLS || r < 0 || r >= CONFIG.ROWS) return false;
    
    // Check if occupied
    if (Grid.get(c, r) !== 0) return false;
    
    // Check if start/end pos
    if ((c === PATH_START.c && r === PATH_START.r) || (c === PATH_END.c && r === PATH_END.r)) {
        return false;
    }
    
    // Check if blocks path
    if (!testPath({c, r})) return false;
    
    return true;
}

function placeTower(c, r, type) {
    const def = TOWER_TYPES[type];
    
    if (!canPlaceTower(c, r)) {
        createHitParticles(Grid.toWorld(c, r).x, Grid.toWorld(c, r).y, '#ff0000');
        return false;
    }
    
    if (!removeMoney(def.cost)) {
        showMessage('Sem Dinheiro!', `Você precisa de $${def.cost} para construir ${def.name}`);
        return false;
    }
    
    const tower = new Tower(c, r, type);
    entities.towers.push(tower);
    Grid.set(c, r, 1);
    
    // Update paths for existing enemies
    updateAllEnemyPaths();
    
    // Build effect
    createBuildEffect(tower.x, tower.y);
    
    return true;
}

function sellTower(tower) {
    const sellValue = tower.getSellValue();
    
    addMoney(sellValue);
    
    const index = entities.towers.indexOf(tower);
    if (index > -1) {
        entities.towers.splice(index, 1);
        Grid.set(tower.c, tower.r, 0);
        
        // Sell effect
        createSellEffect(tower.x, tower.y);
        
        // Update paths
        updateAllEnemyPaths();
    }
}

// Update Towers
function updateTowers(dt) {
    for (const tower of entities.towers) {
        tower.update(dt);
    }
}

// Visual Effects
function createBuildEffect(x, y) {
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        entities.particles.push({
            x, y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 20,
            maxLife: 20,
            color: '#00ff9f',
            size: 4,
            alpha: 1,
        });
    }
}

function createUpgradeEffect(x, y) {
    for (let i = 0; i < 30; i++) {
        entities.particles.push({
            x, y,
            vx: randomRange(-4, 4),
            vy: randomRange(-6, -2),
            life: 40,
            maxLife: 40,
            color: i % 2 === 0 ? '#00ff9f' : '#ffaa00',
            size: randomRange(3, 7),
            alpha: 1,
        });
    }
}

function createSellEffect(x, y) {
    for (let i = 0; i < 15; i++) {
        entities.particles.push({
            x, y,
            vx: randomRange(-3, 3),
            vy: randomRange(-5, -1),
            life: 30,
            maxLife: 30,
            color: '#ffd700',
            size: randomRange(4, 8),
            alpha: 1,
        });
    }
}

// Export
window.TOWER_TYPES = TOWER_TYPES;
window.Tower = Tower;
window.canPlaceTower = canPlaceTower;
window.placeTower = placeTower;
window.sellTower = sellTower;
window.updateTowers = updateTowers;
