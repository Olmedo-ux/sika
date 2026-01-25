# 🚀 Guide Simple - Déployer SikaGreen sur Render (Pas à Pas)

## 📌 Ce dont vous avez besoin

- ✅ Code déjà sur GitHub
- ✅ Compte Render.com (gratuit)
- ⏱️ 20 minutes

---

## PARTIE 1 : Créer la Base de Données PostgreSQL

### Étape 1 : Aller sur Render

1. Ouvrez votre navigateur
2. Allez sur https://render.com
3. Connectez-vous (ou créez un compte gratuit)

### Étape 2 : Créer la Base de Données

1. Cliquez sur le bouton bleu **"New +"** (en haut à droite)
2. Dans le menu qui s'ouvre, cliquez sur **"PostgreSQL"**
3. Remplissez le formulaire :
   - **Name** : Tapez `sikagreen-db`
   - **Database** : Tapez `sikagreen`
   - **User** : Laissez par défaut
   - **Region** : Sélectionnez **"Frankfurt (EU Central)"**
   - **PostgreSQL Version** : Laissez par défaut (16)
   - **Datadog API Key** : Laissez vide
   - **Plan** : Sélectionnez **"Free"** (0$/mois)
4. Cliquez sur le bouton bleu **"Create Database"** en bas
5. **Attendez 1-2 minutes** que la base soit créée

### Étape 3 : Copier l'URL de Connexion

1. Une fois la base créée, vous êtes sur la page de la base
2. Cherchez la section **"Connections"** (en haut)
3. Vous verrez **"Internal Database URL"**
4. Cliquez sur l'icône 📋 (copier) à côté de l'URL
5. **Collez cette URL dans un fichier texte** (Notepad) - vous en aurez besoin plus tard

L'URL ressemble à ça :
```
postgresql://sikagreen:XXXXXXX@dpg-xxxxx-a/sikagreen
```

✅ **Base de données créée !** Passez à la partie 2.

---

## PARTIE 2 : Déployer le Backend Laravel

### Étape 4 : Créer le Service Web

1. Retournez sur le tableau de bord Render (cliquez sur "Dashboard" en haut à gauche)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Vous verrez vos dépôts GitHub
4. Cherchez **"sikagreen"** et cliquez sur **"Connect"** à droite

### Étape 5 : Configuration du Service (IMPORTANT)

Remplissez le formulaire **EXACTEMENT** comme suit :

#### Section "Settings"

| Champ | Valeur à Taper |
|-------|----------------|
| **Name** | `sikagreen-backend` |
| **Region** | Sélectionnez **"Frankfurt (EU Central)"** |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Sélectionnez **"Docker"** |

**⚠️ STOP ICI - Ne cliquez pas encore sur Create !**

#### Section "Build & Deploy"

Descendez et trouvez cette section.

**Dockerfile Path** : Laissez vide (on va créer le Dockerfile)

#### Section "Environment Variables"

Cliquez sur **"Add Environment Variable"** et ajoutez ces variables **UNE PAR UNE** :

**Variable 1** :
- Key : `APP_NAME`
- Value : `SikaGreen`

**Variable 2** :
- Key : `APP_ENV`
- Value : `production`

**Variable 3** :
- Key : `APP_DEBUG`
- Value : `false`

**Variable 4** :
- Key : `APP_KEY`
- Value : Tapez `base64:` puis collez une clé générée (voir ci-dessous ⬇️)

**Variable 5** :
- Key : `DATABASE_URL`
- Value : Collez l'URL PostgreSQL que vous avez copiée à l'étape 3

**Variable 6** :
- Key : `SESSION_DRIVER`
- Value : `database`

**Variable 7** :
- Key : `FILESYSTEM_DISK`
- Value : `public`

**Variable 8** :
- Key : `LOG_LEVEL`
- Value : `error`

#### Générer APP_KEY

**Sur votre ordinateur**, ouvrez PowerShell et tapez :

```powershell
cd "c:\Users\USER\Documents\Projet DevWeb\sikagreen\backend"
php artisan key:generate --show
```

Vous obtiendrez quelque chose comme :
```
base64:abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678
```

Copiez cette clé ENTIÈRE et collez-la dans la **Variable 4** (APP_KEY).

### Étape 6 : Créer le Dockerfile

**PROBLÈME** : Render cherche un Dockerfile qui n'existe pas.

**SOLUTION** : On va le créer maintenant.

**Sur votre ordinateur**, créez un nouveau fichier :

1. Ouvrez VSCode
2. Créez un nouveau fichier dans `backend/Dockerfile`
3. Collez ce contenu :

```dockerfile
FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Cache Laravel configuration
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# Create storage link
RUN php artisan storage:link || true

# Expose port
EXPOSE 8080

# Start command
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8080
```

4. Sauvegardez le fichier
5. Pushez sur GitHub :

```powershell
cd "c:\Users\USER\Documents\Projet DevWeb\sikagreen"
git add backend/Dockerfile
git commit -m "Add Dockerfile for Render deployment"
git push origin main
```

### Étape 7 : Créer le Service

1. Retournez sur Render (la page de configuration du service)
2. Vérifiez que tout est bien rempli
3. Cliquez sur le bouton bleu **"Create Web Service"** en bas
4. **Attendez 5-10 minutes** que le déploiement se termine

### Étape 8 : Vérifier le Déploiement

1. Une fois terminé, vous verrez "Live" en vert en haut
2. Copiez l'URL de votre service (ex: `https://sikagreen-backend.onrender.com`)
3. Ouvrez un nouvel onglet et testez :
   ```
   https://sikagreen-backend.onrender.com/up
   ```
4. Si vous voyez une page blanche ou "OK", c'est bon ! ✅

---

## PARTIE 3 : Déployer le Frontend React

### Étape 9 : Créer le Static Site

1. Retournez sur le tableau de bord Render
2. Cliquez sur **"New +"** → **"Static Site"**
3. Sélectionnez votre dépôt **"sikagreen"**
4. Cliquez sur **"Connect"**

### Étape 10 : Configuration du Frontend

Remplissez le formulaire :

| Champ | Valeur |
|-------|--------|
| **Name** | `sikagreen-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Étape 11 : Ajouter la Variable d'Environnement

1. Descendez à **"Environment Variables"**
2. Cliquez sur **"Add Environment Variable"**
3. Remplissez :
   - **Key** : `VITE_API_URL`
   - **Value** : `https://sikagreen-backend.onrender.com/api`
   
   ⚠️ Remplacez `sikagreen-backend` par le nom exact de votre service backend

4. Cliquez sur **"Create Static Site"**
5. **Attendez 3-5 minutes**

### Étape 12 : Tester le Site

1. Une fois déployé, cliquez sur l'URL du frontend
2. Vous devriez voir la page d'accueil de SikaGreen
3. Testez l'inscription pour vérifier que tout fonctionne

---

## PARTIE 4 : Configurer CORS

### Étape 13 : Mettre à Jour CORS

1. Sur votre ordinateur, ouvrez `backend/config/cors.php`
2. Trouvez la ligne avec `'allowed_origins' => [`
3. Ajoutez l'URL de votre frontend :

```php
'allowed_origins' => [
    'http://localhost:5173',
    'https://sikagreen-frontend.onrender.com', // ← Ajoutez cette ligne
],
```

4. Sauvegardez
5. Pushez sur GitHub :

```powershell
git add backend/config/cors.php
git commit -m "Add frontend URL to CORS"
git push origin main
```

6. Render redéploiera automatiquement le backend (attendez 2-3 minutes)

---

## ✅ TERMINÉ !

Votre application est maintenant en ligne :

- **Backend** : `https://sikagreen-backend.onrender.com`
- **Frontend** : `https://sikagreen-frontend.onrender.com`

---

## 🆘 En Cas de Problème

### Le backend ne démarre pas

1. Allez sur votre service backend sur Render
2. Cliquez sur **"Logs"** (menu de gauche)
3. Cherchez les erreurs en rouge
4. Envoyez-moi le message d'erreur

### Le frontend ne se connecte pas au backend

1. Ouvrez le frontend dans votre navigateur
2. Appuyez sur **F12** (ouvre la console)
3. Cherchez les erreurs en rouge
4. Vérifiez que `VITE_API_URL` est correct

### Erreur "Database connection failed"

1. Vérifiez que `DATABASE_URL` dans les variables d'environnement du backend est correct
2. Retournez sur votre base PostgreSQL
3. Copiez à nouveau l'**Internal Database URL**
4. Mettez à jour la variable `DATABASE_URL` sur Render
5. Redéployez manuellement

---

**Suivez ce guide étape par étape et tout devrait fonctionner ! 🚀**
