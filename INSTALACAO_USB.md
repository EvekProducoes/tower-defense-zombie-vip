# 📱 GUIA COMPLETO - INSTALAÇÃO NO CELULAR VIA USB

## ⚠️ **PRÉ-REQUISITOS**

Para gerar o APK, você precisa do **Android SDK**. Existem 2 opções:

---

## 🎯 **OPÇÃO 1: DOWNLOAD APK JÁ COMPILADO (MAIS RÁPIDO)**

Se você não quer instalar o Android SDK, pode baixar APKs pré-compilados:

### **Usando Serviço Online:**

1. **PhoneGap Build** (grátis): https://build.phonegap.com/

   - Faça upload do projeto
   - Compila na nuvem
   - Baixe o APK pronto

2. **Ionic Appflow** (grátis para teste): https://ionic.io/appflow

   - Similar ao PhoneGap
   - Interface moderna

3. **AppGyver** (outra opção)

---

## 🎯 **OPÇÃO 2: INSTALAR ANDROID SDK (COMPLETO)**

### **Passo 1: Instalar Java JDK**

1. Baixe: https://www.oracle.com/java/technologies/downloads/#java11
2. Escolha: **Java 11** (LTS)
3. Instale normalmente

4. Configure variável de ambiente:
   ```powershell
   # Abra PowerShell como Administrador
   [System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Java\jdk-11', 'Machine')
   ```

### **Passo 2: Instalar Android Studio**

1. Baixe: https://developer.android.com/studio
2. Instale com as opções padrão
3. Abra Android Studio
4. Vá em: **Tools → SDK Manager**
5. Instale:
   - ✅ Android SDK Platform 33
   - ✅ Android SDK Build-Tools 33.0.0
   - ✅ Android SDK Command-line Tools

### **Passo 3: Configurar Variáveis de Ambiente**

```powershell
# PowerShell como Administrador

# ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk', 'Machine')

# Adicionar ao PATH
$path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$newPath = $path + ';C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk\platform-tools;C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk\tools'
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
```

**IMPORTANTE:** Substitua `SEU_USUARIO` pelo seu nome de usuário do Windows!

### **Passo 4: Verificar Instalação**

Abra um NOVO PowerShell e execute:

```bash
java -version
# Deve mostrar: java version "11.x.x"

echo $env:ANDROID_HOME
# Deve mostrar: C:\Users\...\Sdk

adb version
# Deve mostrar a versão do ADB
```

### **Passo 5: Gerar o APK**

```bash
cd "c:\Projetos\Tower Defense ZUMBI"

# Compilar
cordova build android

# APK estará em:
# platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📲 **INSTALAÇÃO VIA USB**

### **1. Preparar o Celular**

1. Vá em **Configurações** → **Sobre o telefone**
2. Toque 7 vezes em **Número da compilação**
3. Opções do desenvolvedor ativadas!
4. Vá em **Configurações** → **Opções do desenvolvedor**
5. Ative:
   - ✅ **Depuração USB**
   - ✅ **Instalação via USB** (se disponível)

### **2. Conectar via USB**

1. Conecte o celular ao PC via cabo USB
2. No celular, permita a depuração USB quando aparecer o popup
3. Marque "Sempre permitir deste computador"

### **3. Verificar Conexão**

```bash
adb devices
```

Deve mostrar seu dispositivo:

```
List of devices attached
ABC123XYZ    device
```

### **4. Instalar o APK**

#### **Método 1: Via Cordova (Automático)**

```bash
cd "c:\Projetos\Tower Defense ZUMBI"
cordova run android
```

Cordova vai:

- Compilar o APK
- Instalar automaticamente
- Abrir o jogo no celular

#### **Método 2: Via ADB (Manual)**

```bash
cd "c:\Projetos\Tower Defense ZUMBI"

# Instalar APK
adb install platforms\android\app\build\outputs\apk\debug\app-debug.apk

# Se já estiver instalado:
adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

#### **Método 3: Copiar e Instalar Manualmente**

1. Copie o APK para o celular:

   ```bash
   adb push platforms\android\app\build\outputs\apk\debug\app-debug.apk /sdcard/Download/
   ```

2. No celular:
   - Abra **Arquivos** ou **Gerenciador de Arquivos**
   - Vá em **Download**
   - Toque em `app-debug.apk`
   - Instale

---

## 🎯 **OPÇÃO 3: SEM INSTALAR NADA (RECOMENDADO!)**

### **Usar Build.phonegap.com:**

1. Crie conta grátis em: https://build.phonegap.com/

2. Compacte seu projeto:

   ```bash
   # Crie um arquivo .zip com:
   - config.xml
   - www/ (pasta completa)
   ```

3. Faça upload do .zip

4. Clique em "Build"

5. Baixe o APK pronto!

6. Envie para seu celular via:

   - Email
   - Google Drive
   - WhatsApp
   - Bluetooth
   - Cabo USB (copiar arquivo)

7. Instale no celular normalmente

---

## 🚀 **MÉTODO MAIS RÁPIDO (SEM SDK)**

### **Usando GitHub Actions (Grátis!):**

Vou criar um workflow que compila o APK automaticamente!

1. Crie arquivo `.github/workflows/build.yml`:

```yaml
name: Build APK

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: "16"

      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          distribution: "adopt"
          java-version: "11"

      - name: Install Cordova
        run: npm install -g cordova

      - name: Install Dependencies
        run: npm install

      - name: Add Android Platform
        run: cordova platform add android

      - name: Build APK
        run: cordova build android

      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-debug
          path: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

2. Faça push para o GitHub
3. Vá em "Actions" → Baixe o APK compilado!

---

## 📊 **RESUMO DOS MÉTODOS**

| Método                | Dificuldade        | Tempo     | Requer SDK?             |
| --------------------- | ------------------ | --------- | ----------------------- |
| PhoneGap Build        | ⭐ Fácil           | 5 min     | ❌ Não                  |
| GitHub Actions        | ⭐⭐ Médio         | 10 min    | ❌ Não                  |
| Copiar APK manual     | ⭐ Fácil           | 2 min     | ✅ Sim (alguém compila) |
| Instalar SDK completo | ⭐⭐⭐⭐⭐ Difícil | 1-2 horas | ✅ Sim                  |

---

## 🎮 **RECOMENDAÇÃO**

**Para testar rápido:**

1. Use **PhoneGap Build** ou **GitHub Actions**
2. Baixe o APK compilado
3. Envie para o celular e instale

**Para desenvolvimento contínuo:**

1. Instale o Android SDK uma vez
2. Compile localmente sempre que precisar

---

## ❓ **TROUBLESHOOTING**

### **"Depuração USB não aparece"**

- Alguns celulares escondem esta opção
- Procure por "Desenvolvedor" nas configurações
- Em alguns Samsung: Configurações → Opções do desenvolvedor

### **"adb não é reconhecido"**

- Feche e abra NOVO PowerShell
- Variáveis de ambiente só carregam em novo terminal

### **"device unauthorized"**

- Desconecte o cabo
- Vá em Opções do desenvolvedor → Revogar autorizações USB
- Conecte novamente
- Autorize quando pedir

### **"App não instala"**

- Vá em Configurações → Segurança
- Ative "Fontes desconhecidas" ou "Instalar apps desconhecidos"

---

## ✅ **VERIFICAÇÃO FINAL**

Depois de instalar, teste:

1. ✅ Jogo abre em fullscreen?
2. ✅ Telas na horizontal (landscape)?
3. ✅ Touch funciona?
4. ✅ Seletor de grid funciona?
5. ✅ Preview de torres verde/vermelho aparece?
6. ✅ Sons tocam?
7. ✅ Power-ups funcionam?

---

**© 2025 Dev.EMFranco - Tower Defense Zombie ViP**

**Qualquer dúvida, me avise!** 😊
