# 🧟 ZOMBIE DEFENSE - Tower Defense Game

![Platform](https://img.shields.io/badge/Platform-Android-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Cordova](https://img.shields.io/badge/Cordova-12.0-red)
![Android](https://img.shields.io/badge/Android-SDK%2033-brightgreen)
![Build](https://github.com/EvekProducoes/tower-defense-zombie-vip/workflows/Build%20Android%20APK/badge.svg)

## 📱 Sobre o Jogo

**Zombie Defense** é um jogo de Tower Defense com visual cyberpunk/apocalíptico onde você deve defender sua base contra hordas infinitas de zumbis!

### ✨ Características

- 🎨 **Design Premium** - Interface cyberpunk com efeitos neon e animações suaves
- 🗼 **3 Tipos de Torres**:

  - **GATLING** 🔫 - Disparo rápido, dano médio
  - **TESLA** ⚡ - Ataque em área, alto dano
  - **SNIPER** 🎯 - Longo alcance, dano máximo

- 🧟 **3 Tipos de Zumbis**:

  - **Normal** - Velocidade e vida equilibradas
  - **Corredor** - Muito rápido, pouca vida
  - **Tanque** - Muito resistente, lento

- 🎮 **Gameplay**:

  - Sistema de pathfinding BFS inteligente
  - Torres não podem bloquear o caminho dos zumbis
  - Sistema de upgrade e venda de torres
  - Ondas progressivamente mais difíceis
  - Estatísticas salvas localmente

- 📱 **Otimizado para Mobile**:
  - Controles touch responsivos
  - Orientação landscape (paisagem)
  - Wake lock para manter tela ligada
  - Performance otimizada

## 🚀 Como Gerar o APK

### ⚡ Método Rápido: GitHub Actions (Recomendado)

O projeto já está configurado com **build automático**!

1. **Faça push para o GitHub:**

   ```bash
   git push
   ```

2. **Aguarde o build** (5-10 minutos)

3. **Baixe o APK:**

   - Vá em: [Actions](https://github.com/EvekProducoes/tower-defense-zombie-vip/actions)
   - Clique no último workflow concluído
   - Download: `TowerDefenseZombieViP-Debug` ou `TowerDefenseZombieViP-Release-Unsigned`

4. **Criar Release Oficial:**
   - Veja o guia completo em [`RELEASE.md`](RELEASE.md)

---

### 🖥️ Método Local: Pré-requisitos

1. **Node.js** (v18 ou superior)
2. **Cordova**:

   ```bash
   npm install -g cordova@12
   ```

3. **Android SDK** com:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33+
   - Java JDK 17+

### Passo a Passo

1. **Instalar dependências**:

   ```bash
   npm install
   ```

2. **Adicionar plataforma Android** (se ainda não adicionado):

   ```bash
   cordova platform add android
   ```

3. **Gerar APK de Debug**:

   ```bash
   cordova build android
   ```

4. **Gerar APK de Release** (para publicação):
   ```bash
   cordova build android --release
   ```

O APK será gerado em:

- **Debug**: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Assinar APK para Publicação

1. Criar keystore:

   ```bash
   keytool -genkey -v -keystore zombie-defense.keystore -alias zombie-defense -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Assinar APK:

   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore zombie-defense.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk zombie-defense
   ```

3. Alinhar APK:
   ```bash
   zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk zombie-defense.apk
   ```

## 🎮 Como Jogar

1. **Selecione uma torre** no painel inferior
2. **Clique no grid** para posicionar (não bloqueie o caminho!)
3. **Clique em torres existentes** para melhorar ou vender
4. **Inicie ondas** para ganhar dinheiro e score
5. **Sobreviva** o máximo de ondas possível!

### Dicas Estratégicas

- 💡 Posicione torres nos cantos para maximizar o alcance
- 💡 Combine torres Tesla (área) com Sniper (dano alto)
- 💡 Atualize torres existentes ao invés de construir muitas básicas
- 💡 Não bloqueie o caminho ou você não poderá construir!

## 📊 Estrutura do Projeto

```
Tower Defense ZUMBI/
├── www/                    # Arquivos do jogo
│   ├── index.html         # HTML principal
│   ├── css/
│   │   └── style.css      # Estilos premium
│   └── js/
│       ├── game.js        # Engine core
│       ├── towers.js      # Sistema de torres
│       ├── enemies.js     # Sistema de zumbis
│       ├── pathfinding.js # BFS pathfinding
│       ├── particles.js   # Renderização
│       ├── ui.js          # Controles UI
│       └── main.js        # Entry point
├── config.xml             # Configuração Cordova
├── package.json           # Dependências
└── README.md             # Este arquivo
```

## 🎨 Design Premium

O jogo utiliza:

- ✅ Paleta cyberpunk (verde neon #00ff9f, rosa #ff006e, roxo #8b5cf6)
- ✅ Gradientes dinâmicos animados
- ✅ Glassmorphism nos cards
- ✅ Glow effects e sombras
- ✅ Animações suaves (transições, pulsos, shake)
- ✅ Partículas detalhadas
- ✅ Tipografia moderna (Orbitron, Rajdhani)

## 🔧 Melhorias Futuras

- [x] Integração AdMob (banners e interstitials) ✅
- [x] Power-ups (slow motion, nuke, etc) ✅
- [x] Efeitos sonoros e música ✅
- [ ] Sistema de achievements
- [ ] Múltiplos mapas/layouts
- [ ] Modo Endless com dificuldade infinita
- [ ] Leaderboard online (Firebase)
- [ ] Skins de torres personalizáveis
- [ ] Boss fights especiais

## 📝 Licença

MIT License - Livre para uso e modificação

## 👨‍💻 Desenvolvimento

Desenvolvido com:

- HTML5 Canvas
- JavaScript ES6
- Cordova
- Amor e café ☕

---

**🎮 Divirta-se sobrevivendo ao apocalipse zumbi! 🧟**
