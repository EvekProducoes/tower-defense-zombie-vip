# 🚀 Guia de Release e Publicação

## 📦 Como Criar uma Nova Release

### Método 1: Via GitHub Interface (Recomendado)

1. **Acesse o GitHub Actions:**

   - Vá para: https://github.com/EvekProducoes/tower-defense-zombie-vip/actions
   - Clique em "Create Release" na sidebar

2. **Execute o Workflow:**

   - Clique em "Run workflow"
   - Digite a versão (ex: `v1.0.0`)
   - Clique em "Run workflow" (botão verde)

3. **Aguarde o Build:**

   - O processo leva ~5-10 minutos
   - Você pode acompanhar em tempo real

4. **Download:**
   - Vá em "Releases" no repositório
   - Baixe o APK Debug ou Release

### Método 2: Via Git Tags

```bash
# Criar e enviar uma tag
git tag v1.0.0
git push origin v1.0.0

# O GitHub Actions vai automaticamente criar a release!
```

---

## 🔐 Como Assinar o APK para Publicação

O APK Release gerado pelo GitHub Actions NÃO está assinado. Para publicar na Play Store:

### Passo 1: Criar Keystore (apenas uma vez)

```bash
keytool -genkey -v -keystore towerdefense.keystore \
  -alias towerdefense \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Guarde bem:**

- O arquivo `.keystore`
- A senha do keystore
- A senha do alias

⚠️ **NUNCA** compartilhe ou faça commit desses dados!

### Passo 2: Assinar o APK

```bash
# 1. Baixe o APK Release do GitHub
# 2. Assine com jarsigner

jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore towerdefense.keystore \
  TowerDefenseZombieViP-v1.0.0-release-unsigned.apk \
  towerdefense
```

### Passo 3: Alinhar o APK

```bash
# Instale zipalign do Android SDK
# Geralmente em: ~/Android/Sdk/build-tools/[versão]/zipalign

zipalign -v 4 \
  TowerDefenseZombieViP-v1.0.0-release-unsigned.apk \
  TowerDefenseZombieViP-v1.0.0-release.apk
```

### Passo 4: Verificar Assinatura

```bash
apksigner verify --verbose TowerDefenseZombieViP-v1.0.0-release.apk
```

Deve mostrar: `Verified using v1 scheme (JAR signing): true`

---

## 📱 Publicação na Google Play Store

### Pré-requisitos

1. ✅ Conta Google Play Developer ($25 uma vez)
2. ✅ APK assinado e alinhado
3. ✅ Ícone 512x512 px
4. ✅ Screenshots (mínimo 2)
5. ✅ Descrição do app

### Checklist de Publicação

- [ ] APK assinado corretamente
- [ ] TargetSdkVersion = 33+ ✅ (já configurado)
- [ ] Ícone de alta qualidade
- [ ] Screenshots do jogo
- [ ] Descrição em português
- [ ] Política de privacidade (se usar AdMob)
- [ ] Classificação etária (10+)

### Enviar para Play Store

1. **Acesse:** https://play.google.com/console
2. **Criar App:**

   - Nome: Tower Defense Zombie ViP
   - Idioma: Português (Brasil)
   - Tipo: Jogo
   - Categoria: Estratégia

3. **Upload APK:**

   - Produção → Criar nova versão
   - Upload do APK assinado
   - Preencher "O que há de novo"

4. **Configurar Loja:**

   - Descrição curta (80 chars)
   - Descrição completa (4000 chars)
   - Screenshots (mín 2, máx 8)
   - Ícone 512x512 px

5. **Classificação de Conteúdo:**

   - Questionário IARC
   - Provavelmente: 10+ (violência leve)

6. **Política de Privacidade:**

   - **OBRIGATÓRIA** porque usa AdMob
   - Hospedar em: GitHub Pages, site pessoal, etc.

7. **Enviar para Revisão:**
   - Pode levar 1-7 dias

---

## 🧪 Testes Antes de Publicar

### Checklist de Testes

- [ ] Testar em pelo menos 2 dispositivos diferentes
- [ ] Verificar todos os tamanhos de tela
- [ ] Testar landscape/portrait
- [ ] Verificar anúncios AdMob (usar Test IDs primeiro!)
- [ ] Testar todas as torres
- [ ] Testar todos os power-ups
- [ ] Verificar salvamento de estatísticas
- [ ] Testar pause/resume do app

### Test IDs AdMob

Durante desenvolvimento, use Test IDs no `admob.js`:

```javascript
isTestMode: true; // Mudar para false antes de publicar!
```

---

## 📊 Versionamento

Siga Semantic Versioning (semver.org):

- **1.0.0** - Release inicial
- **1.0.1** - Bugfixes
- **1.1.0** - Novas features
- **2.0.0** - Breaking changes

### Atualizar Versão

Edite 3 arquivos:

1. **package.json:**

```json
"version": "1.1.0"
```

2. **config.xml:**

```xml
<widget version="1.1.0" android-versionCode="2">
```

3. **Commit e Tag:**

```bash
git add .
git commit -m "Release v1.1.0"
git tag v1.1.0
git push origin main --tags
```

---

## 🔄 Atualizações Via GitHub Actions

### Build Automático

Toda vez que você fizer `git push`:

- GitHub Actions compila automaticamente
- APKs disponíveis em Actions → Artifacts
- Válido por 90 dias

### Release Automático

Quando criar uma tag `v*`:

- GitHub Actions cria Release
- APKs anexados permanentemente
- Usuários podem baixar

---

## 📞 Suporte

### Problemas Comuns

**Build falha no GitHub:**

- Verifique os logs em Actions
- Geralmente é problema de dependência

**APK não instala:**

- Ative "Fontes Desconhecidas"
- Verifique se o APK está assinado

**AdMob não aparece:**

- Use Test IDs primeiro
- Verifique internet no dispositivo
- AdMob leva tempo para ativar novos IDs

**Play Store rejeita:**

- Geralmente é targetSdkVersion baixo (já corrigido!)
- Ou falta política de privacidade

---

## ✅ Próximos Passos

1. **Testar o Build Atual:**

   ```bash
   git add .
   git commit -m "chore: Atualiza para Cordova 12 e Android SDK 33"
   git push
   ```

2. **Aguardar GitHub Actions:**

   - Vá em Actions e veja o build
   - Download do APK Debug

3. **Testar no Dispositivo:**

   - Instale e jogue
   - Verifique se AdMob funciona

4. **Criar Primeira Release:**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

5. **Assinar e Publicar:**
   - Criar keystore
   - Assinar APK
   - Upload na Play Store

---

**© 2025 Dev.EMFranco**

**Boa sorte com sua publicação! 🚀**
