/**
 * ===============================================
 * 🚀 MAIN ENTRY POINT - ZOMBIE DEFENSE
 * ===============================================
 */

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Tower Defense Zombie ViP - Initializing...');
    
    // Load saved stats
    loadStats();
    
    // Initialize Audio
    AudioManager.init();
    
    // Initialize AdMob
    if (typeof AdMob !== 'undefined') {
        AdMobManager.init();
    }
    
    // Initialize UI
    initUI();
    
    // Update menu with stats
    updateMenuStats();
    
    // Hide loading screen after delay
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);
    
    console.log('✅ Game Ready!');
});

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Screen wake lock (keep screen on during gameplay)
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('🔒 Wake Lock activated');
            
            wakeLock.addEventListener('release', () => {
                console.log('🔓 Wake Lock released');
            });
        } catch (err) {
            console.warn('Wake Lock error:', err);
        }
    }
}

async function releaseWakeLock() {
    if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
    }
}

// Request wake lock when game starts
const originalStartGame = window.startGame;
window.startGame = function() {
    originalStartGame();
    requestWakeLock();
    
    // Show banner ad
    if (AdMobManager.initialized) {
        AdMobManager.showBanner();
    }
    
    // Start background music
    AudioManager.playMusic();
    
    // Play button sound
    AudioManager.playSFX('button');
};

// Release wake lock when returning to menu
const originalBackToMenu = window.backToMenu;
window.backToMenu = function() {
    originalBackToMenu();
    releaseWakeLock();
    
    // Hide banner
    if (AdMobManager.initialized) {
        AdMobManager.hideBanner();
    }
    
    // Stop music
    AudioManager.stopMusic();
    
    // Maybe show interstitial
    if (AdMobManager.shouldShowInterstitial()) {
        AdMobManager.showInterstitial();
    }
    AdMobManager.incrementGamesPlayed();
};

// Visibility change handler
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (GameState.isRunning && !GameState.isPaused) {
            togglePause();
        }
        releaseWakeLock();
    } else {
        if (GameState.isRunning) {
            requestWakeLock();
        }
    }
});

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Console branding
console.log('%c 🧟 TOWER DEFENSE ZOMBIE ViP 🧟 ', 'background: #00ff9f; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c © 2025 Dev.EMFranco ', 'background: #ff006e; color: #fff; font-size: 14px; padding: 5px;');
console.log('%c Premium Design + AdMob Ready ', 'background: #8b5cf6; color: #fff; font-size: 12px; padding: 3px;');

// Debug mode (enable with ?debug in URL)
if (window.location.search.includes('debug')) {
    window.DEBUG = true;
    console.log('🐛 Debug mode enabled');
    
    // Debug overlay
    window.addEventListener('keydown', (e) => {
        if (e.key === 'm') GameState.money += 1000;
        if (e.key === 'w') startNextWave();
        if (e.key === 'k') {
            entities.enemies.forEach(e => killEnemy(e));
        }
    });
}

console.log('🎮 Use os controles na tela para jogar!');
