# 🧟 Zombie Defense - Recursos Gráficos

## Ícones e Splash Screens

Os ícones e splash screens devem ser criados nas seguintes resoluções:

### Ícones Android

- **ldpi** (36x36): `res/icon/android/ldpi.png`
- **mdpi** (48x48): `res/icon/android/mdpi.png`
- **hdpi** (72x72): `res/icon/android/hdpi.png`
- **xhdpi** (96x96): `res/icon/android/xhdpi.png`
- **xxhdpi** (144x144): `res/icon/android/xxhdpi.png`
- **xxxhdpi** (192x192): `res/icon/android/xxxhdpi.png`

### Splash Screens Android (Landscape)

- **land-ldpi** (320x200): `res/screen/android/splash-land-ldpi.png`
- **land-mdpi** (480x320): `res/screen/android/splash-land-mdpi.png`
- **land-hdpi** (800x480): `res/screen/android/splash-land-hdpi.png`
- **land-xhdpi** (1280x720): `res/screen/android/splash-land-xhdpi.png`
- **land-xxhdpi** (1600x960): `res/screen/android/splash-land-xxhdpi.png`
- **land-xxxhdpi** (1920x1280): `res/screen/android/splash-land-xxxhdpi.png`

## Como Gerar

### Opção 1: Usar um Gerador Online

1. Acesse: https://icon.kitchen/
2. Faça upload de um ícone 1024x1024
3. Baixe os recursos para Android

### Opção 2: Usar Ferramenta CLI

```bash
npm install -g cordova-res
cordova-res android --skip-config --copy
```

### Opção 3: Criar Manualmente

Use um editor de imagens (Photoshop, GIMP, Figma) para criar:

**Design Sugerido para Ícone:**

- Fundo: Gradiente escuro (#0a0e27 → #1a1f3a)
- Elemento central: Caveira ou símbolo de zumbi
- Cores neon: Verde (#00ff9f), Rosa (#ff006e), Roxo (#8b5cf6)
- Estilo: Cyberpunk/Apocalíptico

**Design Sugerido para Splash:**

- Fundo: Mesmo do ícone
- Título: "ZOMBIE DEFENSE" com fonte Orbitron
- Subtítulo: "GUERRA APOCALÍPTICA"
- Logo centralizado

## Placeholder Temporário

Por enquanto, o Cordova usará ícones padrão. Substitua pelos seus próprios antes da publicação!
