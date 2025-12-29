# 🎮 Tower Defense Zombie ViP - COMO GERAR O APK

## 🚀 **MÉTODO MAIS FÁCIL (SEM INSTALAR NADA!)**

### **Opção 1: GitHub Actions (Automático)**

1. **Suba seu projeto para o GitHub:**

   ```bash
   cd "c:\Projetos\Tower Defense ZUMBI"

   git init
   git add .
   git commit -m "Torre Defense Zombie ViP v1.0"

   # Crie um repositório no GitHub e depois:
   git remote add origin https://github.com/SEU_USUARIO/tower-defense-zombie.git
   git push -u origin main
   ```

2. **GitHub Actions vai compilar automaticamente!**

   - Vá em: **Actions** (na página do GitHub)
   - Veja o build rodando
   - Quando terminar, clique em "Tower-Defense-Zombie-ViP-Debug"
   - Baixe o APK!

3. **Envie para o celular:**
   - Google Drive
   - WhatsApp
   - Email
   - Cabo USB

---

### **Opção 2: PhoneGap Build (Online)**

1. Acesse: https://build.phonegap.com/

2. **Crie um arquivo ZIP** com:

   - `config.xml`
   - Pasta `www/` (completa)

   ```bash
   # No Windows Explorer:
   # Selecione config.xml e pasta www
   # Botão direito → Enviar para → Pasta compactada
   ```

3. Faça upload do ZIP no PhoneGap Build

4. Clique em "Build"

5. Baixe o APK pronto!

---

### **Opção 3: Copiar de Alguém que Compilou**

Se alguém já tem o Android SDK:

1. Peça para compilar com:

   ```bash
   cordova build android
   ```

2. APK estará em:

   ```
   platforms/android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. Envie para você e instale!

---

## 📲 **INSTALAR NO CELULAR**

1. **Ativar instalação de fontes desconhecidas:**

   - Android 8+: Settings → Apps → Special Access → Install unknown apps → Chrome/Files → Allow
   - Android 7-: Settings → Security → Unknown sources → Enable

2. **Transferir APK:**

   - Via cabo USB (copiar para Download)
   - Via WhatsApp/Email/Drive

3. **Instalar:**
   - Abra o APK no celular
   - Toque em "Instalar"
   - Pronto!

---

## 💻 **SE QUISER COMPILAR LOCALMENTE**

**⚠️ AVISO:** Isso é COMPLICADO e demora 1-2 horas!

### **Requisitos:**

- Node.js: https://nodejs.org/
- Java JDK 11: https://www.oracle.com/java/technologies/downloads/#java11
- Android Studio: https://developer.android.com/studio

### **Passos:**

1. **Instalar tudo** (seguir guia em `INSTALACAO_USB.md`)

2. **Configurar variáveis de ambiente:**

   - `JAVA_HOME`
   - `ANDROID_HOME`
   - PATH

3. **Compilar:**

   ```bash
   cd "c:\Projetos\Tower Defense ZUMBI"
   npm install
   cordova platform add android
   cordova build android
   ```

4. **APK em:**
   ```
   platforms\android\app\build\outputs\apk\debug\app-debug.apk
   ```

---

## 📊 **COMPARAÇÃO DOS MÉTODOS**

| Método            | Tempo   | Dificuldade        | Requer Instalação? |
| ----------------- | ------- | ------------------ | ------------------ |
| 🥇 GitHub Actions | 10 min  | ⭐ Fácil           | ❌ Não             |
| 🥈 PhoneGap Build | 5 min   | ⭐ Fácil           | ❌ Não             |
| 🥉 Alguém compila | 2 min   | ⭐ Fácil           | ❌ Não (para você) |
| Local (SDK)       | 2 horas | ⭐⭐⭐⭐⭐ Difícil | ✅ Sim (1-2 GB)    |

---

## ✅ **RECOMENDAÇÃO**

1. **Use GitHub Actions** se souber usar Git
2. **Use PhoneGap Build** se preferir interface web
3. **Peça para alguém** compilar se conhecer alguém com Android SDK
4. **Só instale SDK** se for desenvolver apps Android frequentemente

---

## 🎮 **VERSÃO WEB (TESTAR SEM APK)**

Você pode testar o jogo direto no navegador:

```bash
cd "c:\Projetos\Tower Defense ZUMBI\www"
# Abra index.html no Chrome/Edge
```

**Diferenças da versão web:**

- ✅ Funciona 100%
- ❌ Sem AdMob
- ❌ Sem instalação (precisa abrir no navegador)
- ❌ Sem ícone na tela inicial

---

## 📞 **PRECISA DE AJUDA?**

Veja o guia completo em:

- `INSTALACAO_USB.md` - Detalhes técnicos
- `README.md` - Info do jogo

---

**© 2025 Dev.EMFranco**

**Bom jogo!** 🧟‍♂️🎮
