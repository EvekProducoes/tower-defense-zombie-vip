/**
 * ===============================================
 * 🎵 AUDIO SYSTEM - Sons e Música
 * ===============================================
 */

// Audio Manager
const AudioManager = {
    enabled: true,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    
    // Audio Context (Web Audio API)
    context: null,
    musicSource: null,
    
    init() {
        // Som habilitado por padrão
        const saved = localStorage.getItem('zombieTD_audioEnabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
        
        const savedMusic = localStorage.getItem('zombieTD_musicVolume');
        if (savedMusic) this.musicVolume = parseFloat(savedMusic);
        
        const savedSfx = localStorage.getItem('zombieTD_sfxVolume');
        if (savedSfx) this.sfxVolume = parseFloat(savedSfx);
    },
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('zombieTD_audioEnabled', this.enabled);
        
        if (!this.enabled) {
            this.stopMusic();
        }
    },
    
    // Procedural Sound Effects (Web Audio API)
    playSFX(type) {
        if (!this.enabled) return;
        
        // Lazy init
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const ctx = this.context;
        const now = ctx.currentTime;
        
        switch(type) {
            case 'shoot':
                this.playShoot(ctx, now);
                break;
            case 'hit':
                this.playHit(ctx, now);
                break;
            case 'explosion':
                this.playExplosion(ctx, now);
                break;
            case 'build':
                this.playBuild(ctx, now);
                break;
            case 'upgrade':
                this.playUpgrade(ctx, now);
                break;
            case 'sell':
                this.playSell(ctx, now);
                break;
            case 'wave-start':
                this.playWaveStart(ctx, now);
                break;
            case 'wave-complete':
                this.playWaveComplete(ctx, now);
                break;
            case 'lose-life':
                this.playLoseLife(ctx, now);
                break;
            case 'game-over':
                this.playGameOver(ctx, now);
                break;
            case 'button':
                this.playButton(ctx, now);
                break;
        }
    },
    
    // Sound Effects
    playShoot(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        
        gain.gain.setValueAtTime(this.sfxVolume * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
    },
    
    playHit(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        
        gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
    },
    
    playExplosion(ctx, now) {
        // Noise burst
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start(now);
    },
    
    playBuild(ctx, now) {
        // Rising arpeggio
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + (i * 0.05);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    },
    
    playUpgrade(ctx, now) {
        // Power-up sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
    },
    
    playSell(ctx, now) {
        // Cash register
        const frequencies = [800, 600, 400];
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const startTime = now + (i * 0.05);
            gain.gain.setValueAtTime(this.sfxVolume * 0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    },
    
    playWaveStart(ctx, now) {
        // Alarm
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now + (i * 0.2));
            osc.frequency.setValueAtTime(330, now + (i * 0.2) + 0.1);
            
            gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + (i * 0.2));
            gain.gain.setValueAtTime(0, now + (i * 0.2) + 0.15);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + (i * 0.2));
            osc.stop(now + (i * 0.2) + 0.15);
        }
    },
    
    playWaveComplete(ctx, now) {
        // Victory fanfare
        const melody = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
        
        melody.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + (i * 0.1);
            gain.gain.setValueAtTime(this.sfxVolume * 0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    },
    
    playLoseLife(ctx, now) {
        // Damage sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);
    },
    
    playGameOver(ctx, now) {
        // Descending ominous tones
        const frequencies = [220, 185, 165, 110]; // A3, F#3, E3, A2
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const startTime = now + (i * 0.3);
            gain.gain.setValueAtTime(this.sfxVolume * 0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    },
    
    playButton(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 440;
        
        gain.gain.setValueAtTime(this.sfxVolume * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
    },
    
    // Background Music (Simple procedural loop)
    playMusic() {
        if (!this.enabled || this.musicSource) return;
        
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Simple ambient drone
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 55; // A1
        
        osc2.type = 'sine';
        osc2.frequency.value = 82.5; // E2
        
        gain.gain.value = this.musicVolume * 0.3;
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.context.destination);
        
        osc1.start();
        osc2.start();
        
        this.musicSource = { osc1, osc2 };
    },
    
    stopMusic() {
        if (this.musicSource) {
            this.musicSource.osc1.stop();
            this.musicSource.osc2.stop();
            this.musicSource = null;
        }
    }
};

// Export
window.AudioManager = AudioManager;
