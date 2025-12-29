/**
 * ===============================================
 * 🧟 ENEMY SYSTEM - ZOMBIE TYPES
 * ===============================================
 */

// Enemy Type Definitions
const ENEMY_TYPES = {
    normal: {
        name: 'Zumbi',
        hp: 30,
        speed: 1.5,
        reward: 3,
        scoreValue: 10,
        color: '#44ff44',
        size: 12,
        weight: 60, // Spawn probability weight
    },
    fast: {
        name: 'Corredor',
        hp: 15,
        speed: 3.0,
        reward: 5,
        scoreValue: 20,
        color: '#ff4444',
        size: 10,
        weight: 25,
    },
    tank: {
        name: 'Tanque',
        hp: 100,
        speed: 0.8,
        reward: 10,
        scoreValue: 50,
        color: '#8844ff',
        size: 16,
        weight: 15,
    },
};

// Enemy Class
class Enemy {
    constructor(type, wave) {
        this.type = type;
        const def = ENEMY_TYPES[type];
        
        // Stats (scaled by wave)
        const waveScaling = 1 + (wave * 0.15);
        this.maxHp = Math.floor(def.hp * waveScaling);
        this.hp = this.maxHp;
        this.speed = def.speed * (1 + wave * 0.02);
        this.reward = def.reward + Math.floor(wave * 0.5);
        this.scoreValue = def.scoreValue * wave;
        
        // Visual
        this.color = def.color;
        this.size = def.size;
        this.name = def.name;
        
        // Position (start at spawn point)
        const startPos = Grid.toWorld(PATH_START.c, PATH_START.r);
        this.x = startPos.x;
        this.y = startPos.y;
        
        // Movement
        this.path = null;
        this.currentPathIndex = 0;
        this.targetX = this.x;
        this.targetY = this.y;
        
        // Animation
        this.walkCycle = 0;
        this.wobble = Math.random() * Math.PI * 2;
        
        // Calculate initial path
        this.updatePath();
    }
    
    update(dt) {
        if (!this.path || this.path.length === 0) {
            // Reached end
            enemyReachedEnd(this);
            return;
        }
        
        // Animation
        this.walkCycle += this.speed * 0.1;
        this.wobble += 0.05;
        
        // Get current target tile
        if (this.currentPathIndex < this.path.length) {
            const targetTile = this.path[this.currentPathIndex];
            const worldPos = Grid.toWorld(targetTile.c, targetTile.r);
            this.targetX = worldPos.x;
            this.targetY = worldPos.y;
            
            // Move towards target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.speed) {
                // Reached waypoint
                this.x = this.targetX;
                this.y = this.targetY;
                this.currentPathIndex++;
            } else {
                // Move
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        } else {
            // Reached final destination
            enemyReachedEnd(this);
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        
        // Hit feedback
        createHitParticles(this.x, this.y, this.color);
        
        if (this.hp <= 0) {
            killEnemy(this);
            return true;
        }
        
        return false;
    }
    
    updatePath() {
        const currentTile = Grid.toGrid(this.x, this.y);
        this.path = findPath(currentTile, PATH_END);
        this.currentPathIndex = 0;
    }
    
    getHealthPercent() {
        return this.hp / this.maxHp;
    }
}

// Enemy Spawning
function createEnemy(wave) {
    const type = selectEnemyType(wave);
    return new Enemy(type, wave);
}

function selectEnemyType(wave) {
    // Early waves: mostly normal
    if (wave < 3) return 'normal';
    
    // Build weighted pool
    const pool = [];
    
    for (const [type, def] of Object.entries(ENEMY_TYPES)) {
        // Unlock types gradually
        if (type === 'fast' && wave < 3) continue;
        if (type === 'tank' && wave < 5) continue;
        
        for (let i = 0; i < def.weight; i++) {
            pool.push(type);
        }
    }
    
    return pool[Math.floor(Math.random() * pool.length)];
}

// Update All Enemies
function updateEnemies(dt) {
    for (let i = entities.enemies.length - 1; i >= 0; i--) {
        const enemy = entities.enemies[i];
        enemy.update(dt);
    }
}

// Update All Enemy Paths (when tower is placed/sold)
function updateAllEnemyPaths() {
    for (const enemy of entities.enemies) {
        enemy.updatePath();
    }
}

// Projectile System
function updateProjectiles(dt) {
    for (let i = entities.projectiles.length - 1; i >= 0; i--) {
        const p = entities.projectiles[i];
        
        // Check if target still exists
        if (!p.target || !entities.enemies.includes(p.target)) {
            entities.projectiles.splice(i, 1);
            continue;
        }
        
        // Move towards target
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < p.speed) {
            // Hit!
            if (p.isArea) {
                // Area damage
                damageArea(p.target.x, p.target.y, p.areaRadius, p.damage);
                createExplosion(p.target.x, p.target.y, p.areaRadius);
            } else {
                // Direct damage
                p.target.takeDamage(p.damage);
            }
            
            entities.projectiles.splice(i, 1);
        } else {
            // Move
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
        }
    }
}

function damageArea(x, y, radius, damage) {
    for (const enemy of entities.enemies) {
        const dist = distance(x, y, enemy.x, enemy.y);
        if (dist <= radius) {
            enemy.takeDamage(damage);
        }
    }
}

function createExplosion(x, y, radius) {
    const particleCount = Math.floor(radius / 3);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = randomRange(2, 6);
        
        entities.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 25,
            maxLife: 25,
            color: i % 3 === 0 ? '#ffaa00' : (i % 3 === 1 ? '#ff4400' : '#ffff00'),
            size: randomRange(4, 10),
            alpha: 1,
        });
    }
    
    // Ring effect
    entities.effects.push({
        type: 'explosion-ring',
        x, y,
        radius: 0,
        maxRadius: radius,
        life: 20,
        maxLife: 20,
        color: '#ffaa00',
    });
}

// Export
window.ENEMY_TYPES = ENEMY_TYPES;
window.Enemy = Enemy;
window.createEnemy = createEnemy;
window.updateEnemies = updateEnemies;
window.updateAllEnemyPaths = updateAllEnemyPaths;
window.updateProjectiles = updateProjectiles;
