# 🐘 Configuration PostgreSQL pour Render

## ✅ Avantages de PostgreSQL sur Render

- **Gratuit** : Plan Free avec 256 MB de stockage
- **Intégration native** : Même réseau que votre backend (connexion rapide)
- **Pas de configuration externe** : Tout dans Render
- **Backups automatiques** : Sauvegardes quotidiennes (plan payant)

---

## 📝 Étapes Détaillées

### 1. Créer la Base de Données PostgreSQL

1. Connectez-vous sur https://render.com
2. Cliquez sur **New +** → **PostgreSQL**
3. Configurez :
   - **Name** : `sikagreen-db`
   - **Database** : `sikagreen`
   - **User** : `sikagreen` (ou laissez par défaut)
   - **Region** : **Frankfurt (EU Central)** ⚠️ Même région que votre backend !
   - **PostgreSQL Version** : 16 (dernière version)
   - **Plan** : **Free**
4. Cliquez sur **Create Database**
5. Attendez 1-2 minutes

### 2. Récupérer les Informations de Connexion

Une fois la base créée :

1. Allez dans l'onglet **Info**
2. Vous verrez deux types d'URL :

#### Internal Database URL (Recommandé)
```
postgresql://sikagreen:XXXXX@dpg-xxxxx-a/sikagreen
```
**Utilisez celle-ci** pour connecter votre backend Render (même réseau = gratuit et rapide).

#### External Database URL
```
postgresql://sikagreen:XXXXX@dpg-xxxxx-a.frankfurt-postgres.render.com/sikagreen
```
Utilisez celle-ci pour vous connecter depuis votre machine locale ou des outils externes.

### 3. Configurer le Backend Laravel

#### Option A : Utiliser DATABASE_URL (Recommandé)

Dans les variables d'environnement Render de votre backend, ajoutez **uniquement** :

```env
DATABASE_URL=postgresql://sikagreen:XXXXX@dpg-xxxxx-a/sikagreen
```

Laravel détectera automatiquement cette variable et configurera la connexion PostgreSQL.

**⚠️ Important** : Si vous utilisez `DATABASE_URL`, vous n'avez **pas besoin** de définir `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

#### Option B : Variables Séparées

Si vous préférez les variables séparées :

```env
DB_CONNECTION=pgsql
DB_HOST=dpg-xxxxx-a
DB_PORT=5432
DB_DATABASE=sikagreen
DB_USERNAME=sikagreen
DB_PASSWORD=XXXXX
```

**Copiez les valeurs depuis l'onglet Info de votre base PostgreSQL.**

---

## 🔧 Configuration Locale (Développement)

Pour développer localement avec PostgreSQL :

### 1. Installer PostgreSQL

**Windows** :
```powershell
# Téléchargez depuis https://www.postgresql.org/download/windows/
# Ou avec Chocolatey :
choco install postgresql
```

**macOS** :
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian)** :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la Base de Données Locale

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE sikagreen;

# Créer un utilisateur (optionnel)
CREATE USER sikagreen WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE sikagreen TO sikagreen;

# Quitter
\q
```

### 3. Configurer .env Local

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sikagreen
DB_USERNAME=postgres
DB_PASSWORD=votre_password
```

### 4. Exécuter les Migrations

```bash
cd backend
php artisan migrate
```

---

## 🔄 Différences MySQL vs PostgreSQL

Si vous migrez depuis MySQL, voici les changements :

### Types de Données

| MySQL | PostgreSQL |
|-------|------------|
| `TINYINT(1)` | `BOOLEAN` |
| `DATETIME` | `TIMESTAMP` |
| `LONGTEXT` | `TEXT` |
| `ENUM` | `VARCHAR` avec CHECK ou type ENUM personnalisé |

### Migrations Laravel

Laravel gère automatiquement ces différences. Vos migrations existantes fonctionneront sans modification.

### Fonctions Spécifiques

- MySQL : `CONCAT()` → PostgreSQL : `||` ou `CONCAT()`
- MySQL : `NOW()` → PostgreSQL : `NOW()` ou `CURRENT_TIMESTAMP`
- MySQL : `LIMIT x, y` → PostgreSQL : `LIMIT y OFFSET x`

**Bonne nouvelle** : Eloquent ORM abstrait ces différences, votre code PHP reste identique ! ✅

---

## 🚀 Déploiement sur Render avec PostgreSQL

### Étape 1 : Créer la Base PostgreSQL (fait ✅)

### Étape 2 : Déployer le Backend

Lors de la création du Web Service :

**Variables d'environnement** :
```env
APP_NAME=SikaGreen
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:VOTRE_CLE
APP_URL=https://sikagreen-backend.onrender.com

DATABASE_URL=postgresql://sikagreen:XXXXX@dpg-xxxxx-a/sikagreen

SESSION_DRIVER=database
SESSION_LIFETIME=120
FILESYSTEM_DISK=public
LOG_CHANNEL=stack
LOG_LEVEL=error
```

**Build Command** :
```bash
composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan storage:link
```

**Start Command** :
```bash
php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

### Étape 3 : Vérifier la Connexion

Une fois déployé, vérifiez les logs Render :

```
Migrating: 2024_01_21_000001_create_users_table
Migrated:  2024_01_21_000001_create_users_table (XX.XXms)
...
Migration completed successfully
```

✅ Si vous voyez ça, la connexion PostgreSQL fonctionne !

---

## 🐛 Dépannage PostgreSQL

### Erreur : "could not connect to server"

**Vérifiez** :
1. L'URL de connexion est correcte (copiée depuis Render)
2. Vous utilisez l'**Internal Database URL** (pas External)
3. Le backend et la base sont dans la **même région** (Frankfurt)

### Erreur : "password authentication failed"

**Solution** :
1. Vérifiez que le password dans `DATABASE_URL` est correct
2. Régénérez le password dans Render si nécessaire :
   - Allez sur votre base PostgreSQL
   - Onglet **Settings** → **Reset Password**

### Erreur : "database does not exist"

**Solution** :
1. Vérifiez le nom de la base dans l'URL
2. La base est créée automatiquement par Render, elle devrait exister

### Migrations échouent

**Vérifiez** :
1. Les logs Render pour voir l'erreur exacte
2. Que `php artisan migrate --force` est dans le Start Command
3. Que la connexion DB fonctionne (testez avec `php artisan tinker`)

---

## 📊 Limites du Plan Gratuit

| Ressource | Limite |
|-----------|--------|
| **Stockage** | 256 MB |
| **Connexions** | 97 connexions simultanées |
| **RAM** | Partagée |
| **Backups** | ❌ Non (plan payant uniquement) |
| **Durée de vie** | 90 jours d'inactivité → suppression |

**⚠️ Important** : 
- Après 90 jours sans activité, la base sera supprimée
- Pour des backups automatiques, passez au plan Starter ($7/mois)

---

## 💡 Conseils de Production

### 1. Activer les Connexions Persistantes

Dans `config/database.php` :

```php
'pgsql' => [
    'driver' => 'pgsql',
    // ...
    'options' => [
        PDO::ATTR_PERSISTENT => true,
    ],
],
```

### 2. Optimiser les Requêtes

```php
// Utiliser les index
Schema::table('collections', function (Blueprint $table) {
    $table->index('status');
    $table->index('citizen_id');
    $table->index('collector_id');
});
```

### 3. Monitorer les Performances

Dans Render, onglet **Metrics** de votre base PostgreSQL :
- CPU usage
- Memory usage
- Connections count

---

## 🔗 Ressources

- **Render PostgreSQL Docs** : https://render.com/docs/databases
- **Laravel PostgreSQL** : https://laravel.com/docs/11.x/database#postgresql
- **PostgreSQL Official** : https://www.postgresql.org/docs/

---

**Votre base PostgreSQL est prête ! 🎉**
