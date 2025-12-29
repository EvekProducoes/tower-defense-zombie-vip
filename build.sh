#!/bin/bash

# ============================================
# 🧟 ZOMBIE DEFENSE - BUILD SCRIPT
# ============================================

echo "🧟 ====================================="
echo "🧟  ZOMBIE DEFENSE - APK BUILD"
echo "🧟 ====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Cordova is installed
echo -e "${YELLOW}📦 Verificando Cordova...${NC}"
if ! command -v cordova &> /dev/null
then
    echo -e "${RED}❌ Cordova não encontrado!${NC}"
    echo -e "${YELLOW}Instalando Cordova globalmente...${NC}"
    npm install -g cordova
fi

echo -e "${GREEN}✅ Cordova instalado${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# Add Android platform if not present
if [ ! -d "platforms/android" ]; then
    echo -e "${YELLOW}📱 Adicionando plataforma Android...${NC}"
    cordova platform add android
    echo -e "${GREEN}✅ Plataforma Android adicionada${NC}"
else
    echo -e "${GREEN}✅ Plataforma Android já existe${NC}"
fi

echo ""

# Build
BUILD_TYPE="${1:-debug}"

if [ "$BUILD_TYPE" == "release" ]; then
    echo -e "${YELLOW}🔨 Compilando APK RELEASE...${NC}"
    cordova build android --release
    
    echo ""
    echo -e "${GREEN}✅ APK Release gerado!${NC}"
    echo -e "${YELLOW}📍 Localização:${NC} platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk"
    echo ""
    echo -e "${YELLOW}⚠️  ATENÇÃO: Assine o APK antes de publicar!${NC}"
    echo ""
    echo -e "Para assinar:"
    echo -e "1. keytool -genkey -v -keystore zombie-defense.keystore -alias zombie-defense -keyalg RSA -keysize 2048 -validity 10000"
    echo -e "2. jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore zombie-defense.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk zombie-defense"
    echo -e "3. zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk zombie-defense.apk"
else
    echo -e "${YELLOW}🔨 Compilando APK DEBUG...${NC}"
    cordova build android
    
    echo ""
    echo -e "${GREEN}✅ APK Debug gerado!${NC}"
    echo -e "${YELLOW}📍 Localização:${NC} platforms/android/app/build/outputs/apk/debug/app-debug.apk"
fi

echo ""
echo -e "${GREEN}🎮 Build concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}Para instalar no dispositivo conectado via USB:${NC}"
echo -e "cordova run android"
echo ""
echo -e "🧟 Boa sorte sobrevivendo ao apocalipse! 🧟"
