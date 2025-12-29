/**
 * ===============================================
 * 🗺️ PATHFINDING SYSTEM (BFS - Breadth First Search)
 * ===============================================
 */

// BFS Pathfinding
function findPath(start, end, tempObstacle = null) {
    const queue = [start];
    const cameFrom = new Map();
    const visited = new Set();
    
    const key = (pos) => `${pos.c},${pos.r}`;
    visited.add(key(start));
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Reached destination?
        if (current.c === end.c && current.r === end.r) {
            return reconstructPath(cameFrom, start, end);
        }
        
        // Check neighbors
        const neighbors = getNeighbors(current, tempObstacle);
        
        for (const neighbor of neighbors) {
            const neighborKey = key(neighbor);
            
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                cameFrom.set(neighborKey, current);
                queue.push(neighbor);
            }
        }
    }
    
    // No path found
    return null;
}

function getNeighbors(pos, tempObstacle) {
    const directions = [
        { c: 0, r: 1 },  // Down
        { c: 0, r: -1 }, // Up
        { c: 1, r: 0 },  // Right
        { c: -1, r: 0 }, // Left
    ];
    
    const neighbors = [];
    
    for (const dir of directions) {
        const nc = pos.c + dir.c;
        const nr = pos.r + dir.r;
        
        // Check bounds
        if (nc < 0 || nc >= CONFIG.COLS || nr < 0 || nr >= CONFIG.ROWS) {
            continue;
        }
        
        // Check if obstacle
        let isBlocked = Grid.get(nc, nr) !== 0;
        
        // Check temporary obstacle (for testing tower placement)
        if (tempObstacle && nc === tempObstacle.c && nr === tempObstacle.r) {
            isBlocked = true;
        }
        
        if (!isBlocked) {
            neighbors.push({ c: nc, r: nr });
        }
    }
    
    return neighbors;
}

function reconstructPath(cameFrom, start, end) {
    const path = [];
    let current = end;
    const key = (pos) => `${pos.c},${pos.r}`;
    
    while (current.c !== start.c || current.r !== start.r) {
        path.unshift(current);
        const currentKey = key(current);
        current = cameFrom.get(currentKey);
        
        if (!current) break; // Safety check
    }
    
    return path;
}

// Test if path exists with temporary obstacle
function testPath(tempObstacle) {
    const path = findPath(PATH_START, PATH_END, tempObstacle);
    
    // Also check existing enemies
    for (const enemy of entities.enemies) {
        const enemyPos = Grid.toGrid(enemy.x, enemy.y);
        const enemyPath = findPath(enemyPos, PATH_END, tempObstacle);
        
        if (!enemyPath) return false;
    }
    
    return path !== null;
}

// Export
window.findPath = findPath;
window.testPath = testPath;
