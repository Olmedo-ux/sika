# 🚀 Guide Complet de Déploiement SikaGreen sur Render

## 📋 Vue d'ensemble

Ce guide vous accompagne étape par étape pour déployer :
- **Backend Laravel** (API)
- **Frontend React** (PWA)
- **Base de données MySQL** (externe)

---

## 🗂️ Étape 1 : Préparer le Code pour GitHub

### 1.1 Vérifier les fichiers .gitignore

Les fichiers sensibles sont déjà exclus :
- ✅ `backend/.env`
- ✅ `backend/vendor/`
- ✅ `frontend/node_modules/`
- ✅ `frontend/dist/`

### 1.2 Pusher sur GitHub

```powershell
# Dans le dossier sikagreen
cd "c:\Users\USER\Documents\Projet DevWeb\sikagreen"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - SikaGreen Platform"

# Créer le dépôt sur GitHub (via navigateur)
# https://github.com/new
# Nom: sikagreen
# Visibilité: Public ou Private

# Lier le dépôt (remplacez YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sikagreen.git

# Renommer la branche
git branch -M main

# Pusher
git push -u origin main
```

---

## 🗄️ Étape 2 : Créer une Base de Données

### Option A : PostgreSQL sur Render (Recommandé - Gratuit)

**✅ Avantage** : Intégration native avec Render, pas de configuration externe.

1. Connectez-vous sur https://render.com
2. Cliquez sur **New +** → **PostgreSQL**
3. Configurez la base de données :
   - **Name** : `sikagreen-db`
   - **Database** : `sikagreen`
   - **User** : `sikagreen` (ou laissez par défaut)
   - **Region** : `Frankfurt (EU Central)` (même région que votre backend)
   - **Plan** : **Free** (gratuit)
4. Cliquez sur **Create Database**
5. Attendez 1-2 minutes que la base soit créée
6. Une fois créée, allez dans l'onglet **Info**
7. **Notez les informations de connexion** :
   ```
   Internal Database URL: postgresql://user:pass@hostname/database
   External Database URL: postgresql://user:pass@hostname/database
   
   Ou séparément :
   Hostname: dpg-xxxxx.frankfurt-postgres.render.com
   Port: 5432
   Database: sikagreen
   Username: sikagreen
   Password: xxxxxxxxxxxxx
   ```

**⚠️ Important** : Utilisez l'**Internal Database URL** pour connecter votre backend (même réseau Render = plus rapide et gratuit).

### Option B : PlanetScale MySQL (Alternative - Gratuit)

1. Allez sur https://planetscale.com
2. Créez un compte (gratuit)
3. Cliquez sur **Create database**
   - **Name** : `sikagreen`
   - **Region** : `AWS eu-west-1` (Europe)
4. Cliquez sur **Create database**
5. Allez dans **Connect** → **Create password**
   - **Name** : `render-production`
   - Cliquez sur **Create password**
6. **Notez les informations** (vous ne les reverrez plus) :
   ```
   Host: aws.connect.psdb.cloud
   Username: xxxxxxxxxx
   Password: pscale_pw_xxxxxxxxxx
   Database: sikagreen
   Port: 3306
   ```
7. Copiez la **Connection string** ou les détails individuels

### Option B : Railway (Gratuit avec limites)

1. Allez sur https://railway.app
2. Créez un compte avec GitHub
3. Cliquez sur **New Project** → **Provision MySQL**
4. Une fois créé, cliquez sur le service MySQL
5. Onglet **Variables** → Notez :
   ```
   MYSQL_HOST
   MYSQL_PORT
   MYSQL_DATABASE
   MYSQL_USER
   MYSQL_PASSWORD
   ```

### Option C : Aiven (30 jours gratuits)

1. Allez sur https://aiven.io
2. Créez un compte
3. **Create service** → **MySQL**
4. Sélectionnez le plan gratuit
5. Notez les informations de connexion

---

## 🔧 Étape 3 : Déployer le Backend Laravel sur Render

### 3.1 Créer le Web Service

1. Connectez-vous sur https://render.com
2. Cliquez sur **New +** → **Web Service**
3. Connectez votre compte GitHub (si pas déjà fait)
4. Sélectionnez le dépôt **sikagreen**

### 3.2 Configuration du Service Backend

Remplissez les champs suivants :

| Champ | Valeur |
|-------|--------|
| **Name** | `sikagreen-backend` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Build Command** | Voir ci-dessous ⬇️ |
| **Start Command** | Voir ci-dessous ⬇️ |

#### Build Command (copiez-collez exactement)

```bash
composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan storage:link
```

#### Start Command (copiez-collez exactement)

```bash
php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

**⚠️ Note** : Render utilise la variable `$PORT` automatiquement (pas besoin de spécifier 10000).

### 3.3 Configurer les Variables d'Environnement

Cliquez sur **Advanced** → **Add Environment Variable**

Ajoutez ces variables une par une :

#### Variables Obligatoires

```env
APP_NAME=SikaGreen
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:VOTRE_CLE_ICI
APP_URL=https://sikagreen-backend.onrender.com

DB_CONNECTION=pgsql
DB_HOST=dpg-xxxxx.frankfurt-postgres.render.com
DB_PORT=5432
DB_DATABASE=sikagreen
DB_USERNAME=sikagreen
DB_PASSWORD=votre-password-postgresql

SESSION_DRIVER=database
SESSION_LIFETIME=120

FILESYSTEM_DISK=public

LOG_CHANNEL=stack
LOG_LEVEL=error
```

**💡 Astuce Render** : Au lieu de copier-coller chaque variable, vous pouvez utiliser l'**Internal Database URL** :

```env
DATABASE_URL=postgresql://user:pass@hostname/database
```

Laravel détectera automatiquement cette variable et configurera la connexion.

#### Générer APP_KEY

**Localement**, exécutez :

```bash
cd backend
php artisan key:generate --show
```

Copiez la clé générée (ex: `base64:abcd1234...`) et collez-la dans `APP_KEY`.

#### Remplacer les Valeurs PostgreSQL

**Méthode 1 - URL Complète (Recommandé)** :
Copiez l'**Internal Database URL** depuis Render et ajoutez :
```env
DATABASE_URL=postgresql://user:pass@dpg-xxxxx.frankfurt-postgres.render.com/sikagreen
```

**Méthode 2 - Variables Séparées** :
Remplacez :
- `DB_CONNECTION` : `pgsql` (PostgreSQL)
- `DB_HOST` : Hostname depuis Render (ex: `dpg-xxxxx.frankfurt-postgres.render.com`)
- `DB_PORT` : `5432` (port PostgreSQL standard)
- `DB_DATABASE` : `sikagreen`
- `DB_USERNAME` : Username depuis Render
- `DB_PASSWORD` : Password depuis Render

### 3.4 Créer le Service

1. Cliquez sur **Create Web Service**
2. Render va :
   - Cloner votre dépôt
   - Installer les dépendances (`composer install`)
   - Exécuter les migrations (`php artisan migrate --force`)
   - Démarrer le serveur Laravel
3. **Attendez 5-10 minutes** pour le premier déploiement

### 3.5 Vérifier le Déploiement

Une fois déployé, vous aurez une URL comme :
```
https://sikagreen-backend.onrender.com
```

**Testez le health check** :
```
https://sikagreen-backend.onrender.com/up
```

Réponse attendue : HTTP 200 OK

**Testez l'API** :
```
https://sikagreen-backend.onrender.com/api/user
```

Réponse attendue : `{"message":"Unauthenticated."}` (normal si non connecté)

---

## 🌐 Étape 4 : Déployer le Frontend React sur Render

### 4.1 Créer le Static Site

1. Sur Render, cliquez sur **New +** → **Static Site**
2. Sélectionnez le dépôt **sikagreen**

### 4.2 Configuration du Service Frontend

| Champ | Valeur |
|-------|--------|
| **Name** | `sikagreen-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 4.3 Variables d'Environnement Frontend

Cliquez sur **Advanced** → **Add Environment Variable**

```env
VITE_API_URL=https://sikagreen-backend.onrender.com/api
```

**⚠️ Important** : Remplacez `sikagreen-backend` par le nom exact de votre service backend.

### 4.4 Créer le Static Site

1. Cliquez sur **Create Static Site**
2. Render va :
   - Installer les dépendances npm
   - Builder le projet React (`npm run build`)
   - Déployer le dossier `dist`
3. **Attendez 3-5 minutes**

### 4.5 Vérifier le Déploiement

URL du frontend :
```
https://sikagreen-frontend.onrender.com
```

Visitez cette URL et vérifiez que :
- ✅ La page d'accueil se charge
- ✅ Le design s'affiche correctement
- ✅ Pas d'erreurs dans la console (F12)

---

## 🔐 Étape 5 : Configurer CORS pour la Production

### 5.1 Mettre à Jour config/cors.php

Localement, éditez `backend/config/cors.php` :

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'up'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://sikagreen-frontend.onrender.com',
        'http://localhost:5173', // Pour développement local
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

**⚠️ Remplacez** `sikagreen-frontend.onrender.com` par votre URL frontend réelle.

### 5.2 Pusher les Changements

```bash
git add backend/config/cors.php
git commit -m "Configure CORS for production"
git push origin main
```

Render redéploiera automatiquement le backend.

---

## ✅ Étape 6 : Tests Post-Déploiement

### 6.1 Tester le Backend

**Health Check** :
```
https://sikagreen-backend.onrender.com/up
```
✅ Doit retourner HTTP 200

**API Test** :
```
https://sikagreen-backend.onrender.com/api/user
```
✅ Doit retourner `{"message":"Unauthenticated."}`

### 6.2 Tester le Frontend

1. Visitez `https://sikagreen-frontend.onrender.com`
2. Ouvrez la console (F12)
3. Vérifiez qu'il n'y a **pas d'erreurs CORS**
4. Testez l'inscription :
   - Créez un compte citoyen
   - Vérifiez que la requête API fonctionne
5. Testez la connexion

### 6.3 Tester la Base de Données

1. Connectez-vous avec le compte créé
2. Créez une demande de collecte
3. Vérifiez dans PlanetScale/Railway que les données sont enregistrées

---

## 🐛 Dépannage Courant

### Erreur : "APP_KEY not set"

**Solution** :
```bash
# Localement
php artisan key:generate --show
```
Copiez la clé et ajoutez-la dans les variables d'environnement Render.

### Erreur : "CORS policy blocked"

**Vérifiez** :
1. `backend/config/cors.php` contient l'URL du frontend
2. Le middleware CORS est activé dans `bootstrap/app.php` (déjà fait ✅)
3. Redéployez le backend après modification

### Erreur : "Database connection failed"

**Vérifiez** :
1. Les variables `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` sont correctes
2. La base de données est bien créée sur PlanetScale/Railway
3. Le port est `3306` (MySQL standard)

### Erreur : "Storage link not found"

**Solution** : Exécutez manuellement dans le shell Render :
1. Allez sur votre service backend
2. Onglet **Shell**
3. Exécutez :
   ```bash
   php artisan storage:link
   ```

### Frontend ne charge pas (page blanche)

**Vérifiez** :
1. La console navigateur (F12) pour les erreurs
2. Que `VITE_API_URL` pointe vers le bon backend
3. Que le build s'est terminé sans erreur (logs Render)

### Service inactif après 15 minutes

**Normal sur le plan gratuit** : Les services s'endorment après 15 min d'inactivité. Le premier accès prend ~30s pour redémarrer.

**Solution** : Upgrade vers un plan payant ($7/mois) pour garder le service actif 24/7.

---

## 📊 Monitoring et Logs

### Voir les Logs Backend

1. Allez sur votre service `sikagreen-backend`
2. Onglet **Logs**
3. Logs en temps réel des requêtes et erreurs

### Voir les Logs Frontend

1. Allez sur votre site `sikagreen-frontend`
2. Onglet **Logs**
3. Logs du build et déploiement

### Historique des Déploiements

Onglet **Events** pour voir tous les déploiements passés.

---

## 🔄 Mises à Jour Futures

Pour déployer des modifications :

```bash
# Faites vos modifications
git add .
git commit -m "Description des changements"
git push origin main
```

**Render redéploiera automatiquement** :
- Backend : ~5-10 minutes
- Frontend : ~3-5 minutes

---

## 💰 Coûts Render

### Plan Gratuit (Actuel)

- ✅ **Static Sites** : Illimité et gratuit
- ✅ **Web Services** : 750h/mois gratuit (1 service 24/7)
- ⚠️ **Limitations** :
  - Service s'endort après 15 min d'inactivité
  - Redémarrage ~30s au premier accès
  - 100 GB bande passante/mois

### Plan Starter ($7/mois par service)

- ✅ Service actif 24/7 (pas d'endormissement)
- ✅ 100 GB bande passante/mois
- ✅ Support prioritaire

---

## 🎯 Checklist Finale

- [ ] Code pushé sur GitHub
- [ ] Base de données MySQL créée (PlanetScale/Railway/Aiven)
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement backend configurées
- [ ] APP_KEY généré et ajouté
- [ ] Migrations exécutées avec succès
- [ ] Frontend déployé sur Render
- [ ] VITE_API_URL configuré
- [ ] CORS configuré dans backend
- [ ] Health check backend fonctionne (`/up`)
- [ ] Frontend se charge correctement
- [ ] Inscription/Connexion testée
- [ ] Création de collecte testée
- [ ] Données enregistrées dans la base

---

## 🆘 Besoin d'Aide ?

### Ressources Officielles

- **Render Docs** : https://render.com/docs
- **Laravel Deployment** : https://laravel.com/docs/11.x/deployment
- **Vite Deployment** : https://vitejs.dev/guide/static-deploy.html

### Support Render

- **Discord** : https://render.com/discord
- **Email** : support@render.com

---

## 🎉 Félicitations !

Votre application **SikaGreen** est maintenant déployée en production sur Render !

**URLs de Production** :
- Backend API : `https://sikagreen-backend.onrender.com`
- Frontend PWA : `https://sikagreen-frontend.onrender.com`

**Prochaines Étapes** :
1. Configurer un nom de domaine personnalisé (optionnel)
2. Activer HTTPS (automatique sur Render)
3. Configurer les notifications push (Firebase)
4. Ajouter le paiement mobile money
5. Monitorer les performances

**Bon lancement ! 🚀🌿**
