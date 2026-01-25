# 🚀 Guide de Déploiement SikaGreen

## 📋 Prérequis

- Compte GitHub
- Compte Render.com (gratuit)
- Git installé localement
- Node.js 18+ et PHP 8.2+ (pour tests locaux)

---

## 🔧 Étape 1 : Préparation du Projet

### 1.1 Vérifier les fichiers sensibles

Assurez-vous que les fichiers suivants sont bien dans `.gitignore` :

```
backend/.env
backend/.env.production
frontend/.env
frontend/.env.local
node_modules/
vendor/
```

### 1.2 Créer les fichiers d'exemple

**Backend** : Vérifiez que `backend/.env.example` existe avec :

```env
APP_NAME=SikaGreen
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-backend.onrender.com

DB_CONNECTION=mysql
DB_HOST=your-mysql-host
DB_PORT=3306
DB_DATABASE=sikagreen
DB_USERNAME=your-username
DB_PASSWORD=your-password

SESSION_DRIVER=database
SESSION_LIFETIME=120

FILESYSTEM_DISK=public
```

**Frontend** : Créez `frontend/.env.example` :

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 📦 Étape 2 : Initialiser Git et Pusher sur GitHub

### 2.1 Initialiser le dépôt Git

```bash
cd "c:/Users/USER/Documents/Projet DevWeb/sikagreen"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - SikaGreen Platform"
```

### 2.2 Créer un dépôt sur GitHub

1. Allez sur https://github.com/new
2. Nom du dépôt : `sikagreen`
3. Description : "Plateforme d'économie circulaire pour le Togo"
4. Visibilité : **Public** ou **Private**
5. **Ne pas** initialiser avec README (vous en avez déjà un)
6. Cliquez sur **Create repository**

### 2.3 Lier et pusher vers GitHub

```bash
# Remplacez YOUR_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR_USERNAME/sikagreen.git

# Renommer la branche principale en 'main' (si nécessaire)
git branch -M main

# Pusher vers GitHub
git push -u origin main
```

---

## ☁️ Étape 3 : Déployer le Backend sur Render

### 3.1 Créer une Base de Données MySQL

1. Connectez-vous sur https://render.com
2. Cliquez sur **New +** → **PostgreSQL** (Render ne propose pas MySQL gratuit)
   
   **Alternative MySQL** : Utilisez un service externe comme :
   - **PlanetScale** (gratuit) : https://planetscale.com
   - **Railway** (gratuit avec limites) : https://railway.app
   - **Aiven** (gratuit 30 jours) : https://aiven.io

3. Notez les informations de connexion :
   - Host
   - Port
   - Database name
   - Username
   - Password

### 3.2 Déployer le Backend Laravel

1. Sur Render, cliquez sur **New +** → **Web Service**
2. Connectez votre dépôt GitHub `sikagreen`
3. Configurez le service :

   **Paramètres de base** :
   - **Name** : `sikagreen-backend`
   - **Region** : Frankfurt (Europe) ou le plus proche
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : `PHP`
   - **Build Command** :
     ```bash
     composer install --no-dev --optimize-autoloader && php artisan key:generate && php artisan migrate --force && php artisan storage:link
     ```
   - **Start Command** :
     ```bash
     php artisan serve --host=0.0.0.0 --port=$PORT
     ```

   **Variables d'environnement** (onglet Environment) :
   ```
   APP_NAME=SikaGreen
   APP_ENV=production
   APP_KEY=base64:VOTRE_CLE_GENEREE
   APP_DEBUG=false
   APP_URL=https://sikagreen-backend.onrender.com
   
   DB_CONNECTION=mysql
   DB_HOST=votre-mysql-host
   DB_PORT=3306
   DB_DATABASE=sikagreen
   DB_USERNAME=votre-username
   DB_PASSWORD=votre-password
   
   SESSION_DRIVER=database
   SESSION_LIFETIME=120
   
   FILESYSTEM_DISK=public
   ```

4. Cliquez sur **Create Web Service**
5. Attendez le déploiement (5-10 minutes)
6. Notez l'URL du backend : `https://sikagreen-backend.onrender.com`

### 3.3 Générer APP_KEY

Si vous n'avez pas encore de `APP_KEY` :

```bash
# Localement
cd backend
php artisan key:generate --show
```

Copiez la clé générée et ajoutez-la dans les variables d'environnement Render.

---

## 🌐 Étape 4 : Déployer le Frontend sur Render (ou Netlify/Vercel)

### Option A : Render

1. Sur Render, cliquez sur **New +** → **Static Site**
2. Connectez votre dépôt GitHub `sikagreen`
3. Configurez :

   - **Name** : `sikagreen-frontend`
   - **Branch** : `main`
   - **Root Directory** : `frontend`
   - **Build Command** :
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory** : `dist`

   **Variables d'environnement** :
   ```
   VITE_API_URL=https://sikagreen-backend.onrender.com/api
   ```

4. Cliquez sur **Create Static Site**
5. Attendez le déploiement (3-5 minutes)
6. URL du frontend : `https://sikagreen-frontend.onrender.com`

### Option B : Netlify (Recommandé pour le frontend)

1. Allez sur https://netlify.com
2. Cliquez sur **Add new site** → **Import an existing project**
3. Connectez GitHub et sélectionnez `sikagreen`
4. Configurez :
   - **Base directory** : `frontend`
   - **Build command** : `npm run build`
   - **Publish directory** : `frontend/dist`
   - **Environment variables** :
     ```
     VITE_API_URL=https://sikagreen-backend.onrender.com/api
     ```
5. Cliquez sur **Deploy**

### Option C : Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **Add New** → **Project**
3. Importez votre dépôt GitHub
4. Configurez :
   - **Framework Preset** : Vite
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Environment Variables** :
     ```
     VITE_API_URL=https://sikagreen-backend.onrender.com/api
     ```
5. Cliquez sur **Deploy**

---

## 🔐 Étape 5 : Configuration CORS (Backend)

Mettez à jour `backend/config/cors.php` pour autoriser votre frontend :

```php
'allowed_origins' => [
    'https://sikagreen-frontend.onrender.com',
    'https://your-netlify-domain.netlify.app',
    'http://localhost:5173', // Pour développement local
],
```

Ou utilisez un wildcard (moins sécurisé) :

```php
'allowed_origins' => ['*'],
```

Committez et poussez les changements :

```bash
git add .
git commit -m "Configure CORS for production"
git push origin main
```

Render redéploiera automatiquement.

---

## ✅ Étape 6 : Vérification Post-Déploiement

### 6.1 Tester le Backend

Visitez : `https://sikagreen-backend.onrender.com/api/health`

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2026-01-25T06:30:00Z"
}
```

### 6.2 Tester le Frontend

1. Visitez : `https://sikagreen-frontend.onrender.com`
2. Vérifiez que la page d'accueil se charge
3. Testez l'inscription/connexion
4. Vérifiez la console navigateur (F12) pour les erreurs

### 6.3 Tester la Base de Données

Connectez-vous avec un compte test et créez une collecte pour vérifier que les données sont bien enregistrées.

---

## 🐛 Dépannage

### Erreur : "APP_KEY not set"

Générez une clé et ajoutez-la dans les variables d'environnement Render :

```bash
php artisan key:generate --show
```

### Erreur : "CORS policy"

Vérifiez `backend/config/cors.php` et assurez-vous que l'URL du frontend est autorisée.

### Erreur : "Database connection failed"

Vérifiez les variables d'environnement de la base de données (host, port, username, password).

### Erreur : "Storage link not found"

Exécutez manuellement dans le shell Render :

```bash
php artisan storage:link
```

### Frontend ne se connecte pas au backend

Vérifiez que `VITE_API_URL` dans les variables d'environnement du frontend pointe bien vers l'URL du backend.

---

## 🔄 Mises à Jour Futures

Pour déployer des modifications :

```bash
# Faites vos modifications
git add .
git commit -m "Description des changements"
git push origin main
```

Render redéploiera automatiquement backend et frontend.

---

## 📊 Monitoring et Logs

### Render Logs

1. Allez sur votre service Render
2. Onglet **Logs** pour voir les logs en temps réel
3. Onglet **Events** pour l'historique des déploiements

### Laravel Logs

Les logs Laravel sont dans `storage/logs/laravel.log` (accessible via shell Render).

---

## 💰 Coûts

### Render (Plan Gratuit)

- **Web Services** : 750h/mois gratuit (suffisant pour 1 service 24/7)
- **Static Sites** : Illimité et gratuit
- **Limitations** :
  - Services inactifs après 15 min sans requête (redémarrage ~30s)
  - 100 GB bande passante/mois

### Alternatives Gratuites

- **Frontend** : Netlify, Vercel, GitHub Pages
- **Backend** : Railway (500h/mois), Fly.io (3 VM gratuits)
- **Database** : PlanetScale (5GB gratuit), Supabase (500MB gratuit)

---

## 🎯 Checklist Finale

- [ ] Code pushé sur GitHub
- [ ] Base de données MySQL créée
- [ ] Backend déployé sur Render
- [ ] Frontend déployé (Render/Netlify/Vercel)
- [ ] Variables d'environnement configurées
- [ ] CORS configuré
- [ ] Migrations exécutées
- [ ] Storage link créé
- [ ] Tests de connexion réussis
- [ ] Inscription/Connexion fonctionnelle

---

## 📞 Support

En cas de problème, consultez :

- **Render Docs** : https://render.com/docs
- **Laravel Deployment** : https://laravel.com/docs/11.x/deployment
- **Vite Deployment** : https://vitejs.dev/guide/static-deploy.html

---

**Bon déploiement ! 🚀**
