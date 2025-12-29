@echo off
REM ============================================
REM 🧟 ZOMBIE DEFENSE - BUILD SCRIPT (Windows)
REM ============================================

echo.
echo =====================================
echo   ZOMBIE DEFENSE - APK BUILD
echo =====================================
echo.

REM Check if Cordova is installed
echo [92m[INFO][0m Verificando Cordova...
where cordova >nul 2>nul
if %errorlevel% neq 0 (
    echo [91m[ERROR][0m Cordova not encontrado!
    echo [93m[INFO][0m Instalando Cordova globalmente...
    call npm install -g cordova
)

echo [92m[OK][0m Cordova instalado
echo.

REM Install dependencies
echo [93m[INFO][0m Instalando dependencias...
call npm install

echo [92m[OK][0m Dependencias instaladas
echo.

REM Add Android platform if not present
if not exist "platforms\android" (
    echo [93m[INFO][0m Adicionando plataforma Android...
    call cordova platform add android
    echo [92m[OK][0m Plataforma Android adicionada
) else (
    echo [92m[OK][0m Plataforma Android ja existe
)

echo.

REM Build
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=debug

if "%BUILD_TYPE%"=="release" (
    echo [93m[INFO][0m Compilando APK RELEASE...
    call cordova build android --release
    
    echo.
    echo [92m[OK][0m APK Release gerado!
    echo [93m[INFO][0m Localizacao: platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk
    echo.
    echo [91m[ATENCAO][0m Assine o APK antes de publicar!
) else (
    echo [93m[INFO][0m Compilando APK DEBUG...
    call cordova build android
    
    echo.
    echo [92m[OK][0m APK Debug gerado!
    echo [93m[INFO][0m Localizacao: platforms\android\app\build\outputs\apk\debug\app-debug.apk
)

echo.
echo [92m[OK][0m Build concluido com sucesso!
echo.
echo Para instalar no dispositivo conectado via USB:
echo cordova run android
echo.
echo 🧟 Boa sorte sobrevivendo ao apocalipse! 🧟
echo.

pause
