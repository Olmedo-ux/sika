# 📁 Documentation du Système de Stockage - SikaGreen

## 🏗️ Structure des Répertoires

```
backend/
├── storage/
│   └── app/
│       ├── private/          # Fichiers privés (non accessibles publiquement)
│       └── public/           # Fichiers publics (accessibles via HTTP)
│           ├── avatars/      # Photos de profil des utilisateurs
│           ├── images/       # Images générales uploadées
│           └── chat_media/   # Médias des conversations (images, audio)
│
└── public/
    └── storage/              # Junction link → storage/app/public/
```

## 🔗 Lien Symbolique (Junction)

### État Actuel
- **Type**: Junction (Windows) - Ne nécessite pas de privilèges administrateur
- **Source**: `public/storage`
- **Cible**: `storage/app/public`
- **Statut**: ✅ Fonctionnel

### Vérification
```powershell
# Vérifier le lien
Get-Item "public\storage" | Select-Object Target, LinkType

# Recréer si nécessaire (depuis backend/)
Remove-Item "public\storage" -Force
New-Item -ItemType Junction -Path "public\storage" -Target "storage\app\public"
```

## 🌐 Accès aux Fichiers avec CORS

### ⚠️ IMPORTANT: Utiliser les Routes API

**Tous les fichiers doivent être accessibles via `/api/storage/` et NON `/storage/`**

#### ❌ Ancien système (sans CORS)
```
http://localhost:8000/storage/avatars/user_123.jpeg
→ Bloqué par OpaqueResponseBlocking (pas de headers CORS)
```

#### ✅ Nouveau système (avec CORS)
```
http://localhost:8000/api/storage/avatars/user_123.jpeg
→ Headers CORS corrects, accessible depuis le frontend
```

### Route API Configurée

**Fichier**: `routes/api.php`
```php
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        abort(404);
    }
    
    $mimeType = mime_content_type($filePath);
    
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => request()->header('Origin', '*'),
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
    ]);
})->where('path', '.*');
```

## 📤 Upload de Fichiers

### Contrôleurs Configurés

#### 1. **AuthController** - Avatars
```php
// Upload avatar (base64)
Storage::disk('public')->put($filename, $data);
$updateData['avatar'] = url('api/storage/' . $filename);
```

#### 2. **UploadController** - Images générales
```php
// Upload image
$path = $image->storeAs('images', $filename, 'public');
$url = url('api/storage/' . $path);
```

#### 3. **ChatController** - Médias de chat
```php
// Upload média
$path = $file->storeAs('chat_media', $fileName, 'public');
$mediaUrl = url('api/storage/' . $path);
```

## 🗄️ Base de Données

### Migration Appliquée
**Fichier**: `2026_01_25_022700_update_storage_urls_to_api_routes.php`

Cette migration a converti automatiquement toutes les anciennes URLs:
- `users.avatar`: `/storage/` → `/api/storage/`
- `chat_messages.media_url`: `/storage/` → `/api/storage/`
- `marketplace_products.image_url`: `/storage/` → `/api/storage/`
- `marketplace_products.image_urls`: `/storage/` → `/api/storage/`

### Vérification
```bash
php artisan tinker
# Vérifier les URLs mises à jour
User::where('avatar', 'like', '%/api/storage/%')->count();
```

## ⚙️ Configuration CORS

### Fichier: `config/cors.php`
```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

'allowed_origins' => [
    'http://localhost:8080', 
    'http://localhost:3000', 
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8081'
],

'supports_credentials' => true,
```

### Middleware: `bootstrap/app.php`
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
    $middleware->web(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
})
```

## 🔒 Sécurité & Git

### Fichiers .gitignore
Tous les répertoires de stockage ont des `.gitignore` pour éviter de committer les fichiers uploadés:

```gitignore
*
!.gitignore
```

**Répertoires protégés**:
- `storage/app/public/avatars/`
- `storage/app/public/images/`
- `storage/app/public/chat_media/`

## 🧪 Tests & Vérification

### Test CORS
```powershell
# Test avec Origin header
Invoke-WebRequest -Uri "http://localhost:8000/api/storage/avatars/test.jpeg" `
    -Headers @{"Origin"="http://localhost:8081"} `
    -UseBasicParsing | Select-Object -ExpandProperty Headers
```

### Test Upload
```bash
# Via API
curl -X POST http://localhost:8000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

## 🚨 Résolution de Problèmes

### Problème: Images ne se chargent pas
1. ✅ Vérifier que le lien junction existe: `Get-Item "public\storage"`
2. ✅ Vérifier que les URLs utilisent `/api/storage/` et non `/storage/`
3. ✅ Vérifier que le serveur Laravel est redémarré après changements CORS
4. ✅ Vérifier les headers CORS dans la console du navigateur

### Problème: Erreur 403 ou NS_BINDING_ABORTED
- **Cause**: Fichiers servis sans headers CORS
- **Solution**: Utiliser `/api/storage/` au lieu de `/storage/`

### Problème: Fichiers non trouvés après upload
1. Vérifier que le fichier existe: `Get-ChildItem "storage\app\public\avatars"`
2. Vérifier le lien junction: `Get-Item "public\storage"`
3. Recréer le lien si nécessaire (voir section "Lien Symbolique")

## 📋 Checklist de Déploiement

Avant de déployer en production:

- [ ] Vérifier que le lien `public/storage` existe
- [ ] Exécuter la migration: `php artisan migrate`
- [ ] Vérifier les permissions des répertoires storage (755/644)
- [ ] Configurer les origines CORS autorisées pour la production
- [ ] Tester l'upload et l'accès aux fichiers
- [ ] Vérifier que tous les contrôleurs utilisent `url('api/storage/')`

## 🔄 Commandes Utiles

```bash
# Recréer le lien storage
php artisan storage:link

# Vérifier les migrations
php artisan migrate:status

# Nettoyer le cache
php artisan config:clear
php artisan cache:clear

# Vérifier les permissions
chmod -R 755 storage
chmod -R 644 storage/app/public/*
```

---

**Date de dernière mise à jour**: 25 janvier 2026  
**Version**: 1.0  
**Statut**: ✅ Production Ready
