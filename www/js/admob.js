/**
 * ===============================================
 * 📢 ADMOB INTEGRATION
 * ===============================================
 */

const AdMobManager = {
    initialized: false,
    bannerVisible: false,
    
    // IDs fornecidos pelo Dev.EMFranco
    IDS: {
        banner: 'ca-app-pub-4345529944295998/3810035800',
        interstitial: 'ca-app-pub-4345529944295998/7329003630',
    },
    
    // Test IDS (use durante desenvolvimento)
    TEST_IDS: {
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
    },
    
    isTestMode: false, // Mudar para false na versão de produção
    
    init() {
        // Só funciona em dispositivo real com Cordova
        if (typeof AdMob === 'undefined') {
            console.log('AdMob não disponível (ambiente web)');
            return;
        }
        
        const ids = this.isTestMode ? this.TEST_IDS : this.IDS;
        
        AdMob.setOptions({
            publisherId: ids.banner,
            interstitialAdId: ids.interstitial,
            autoShow: false,
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            isTesting: this.isTestMode,
            bgColor: 'black'
        });
        
        this.initialized = true;
        console.log('✅ AdMob inicializado');
        
        // Preparar interstitial
        this.prepareInterstitial();
    },
    
    // Banner
    showBanner() {
        if (!this.initialized || this.bannerVisible) return;
        
        AdMob.createBanner({
            adId: this.isTestMode ? this.TEST_IDS.banner : this.IDS.banner,
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            autoShow: true,
            isTesting: this.isTestMode
        });
        
        this.bannerVisible = true;
        console.log('📢 Banner exibido');
    },
    
    hideBanner() {
        if (!this.initialized || !this.bannerVisible) return;
        
        AdMob.removeBanner();
        this.bannerVisible = false;
        console.log('📢 Banner removido');
    },
    
    // Interstitial
    prepareInterstitial() {
        if (!this.initialized) return;
        
        AdMob.prepareInterstitial({
            adId: this.isTestMode ? this.TEST_IDS.interstitial : this.IDS.interstitial,
            autoShow: false,
            isTesting: this.isTestMode
        });
    },
    
    showInterstitial(callback) {
        if (!this.initialized) {
            if (callback) callback();
            return;
        }
        
        // Registrar callback para quando fechar
        if (callback) {
            document.addEventListener('onAdDismiss', function handler() {
                callback();
                document.removeEventListener('onAdDismiss', handler);
            });
        }
        
        AdMob.showInterstitial();
        
        // Preparar próximo
        setTimeout(() => this.prepareInterstitial(), 1000);
        
        console.log('📢 Interstitial exibido');
    },
    
    // Helpers para mostrar ads em momentos estratégicos
    shouldShowInterstitial() {
        // Mostrar interstitial a cada 3 game overs ou 5 ondas completadas
        const gamesPlayed = parseInt(localStorage.getItem('zombieTD_gamesPlayed') || '0');
        return gamesPlayed > 0 && gamesPlayed % 3 === 0;
    },
    
    incrementGamesPlayed() {
        const current = parseInt(localStorage.getItem('zombieTD_gamesPlayed') || '0');
        localStorage.setItem('zombieTD_gamesPlayed', (current + 1).toString());
    }
};

// Export
window.AdMobManager = AdMobManager;
