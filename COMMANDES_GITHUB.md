# 📝 Commandes Git pour Pusher sur GitHub

## 🚀 Étapes Rapides

### 1. Initialiser Git et Faire le Premier Commit

```powershell
# Aller dans le dossier du projet
cd "c:\Users\USER\Documents\Projet DevWeb\sikagreen"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - SikaGreen Platform"
```

### 2. Créer le Dépôt sur GitHub

1. Allez sur https://github.com/new
2. Remplissez :
   - **Repository name** : `sikagreen`
   - **Description** : `Plateforme d'économie circulaire pour le Togo - Laravel + React PWA`
   - **Visibilité** : Public ou Private (votre choix)
3. **NE COCHEZ PAS** :
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. Cliquez sur **Create repository**

### 3. Lier le Dépôt Local à GitHub

```powershell
# Remplacez YOUR_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR_USERNAME/sikagreen.git

# Vérifier que le remote est bien ajouté
git remote -v
```

### 4. Renommer la Branche en 'main'

```powershell
git branch -M main
```

### 5. Pusher vers GitHub

```powershell
# Premier push
git push -u origin main
```

**Si demande d'authentification** :
- Utilisez votre nom d'utilisateur GitHub
- Pour le mot de passe, utilisez un **Personal Access Token** (pas votre mot de passe GitHub)

---

## 🔑 Créer un Personal Access Token (si nécessaire)

Si Git vous demande un mot de passe :

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur **Generate new token** → **Generate new token (classic)**
3. Remplissez :
   - **Note** : `SikaGreen Deployment`
   - **Expiration** : 90 days (ou No expiration)
   - **Scopes** : Cochez `repo` (accès complet aux dépôts)
4. Cliquez sur **Generate token**
5. **Copiez le token** (vous ne le reverrez plus !)
6. Utilisez ce token comme mot de passe lors du push

---

## 🔄 Commandes Git pour les Mises à Jour Futures

Après avoir modifié du code :

```powershell
# Voir les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add .

# Ou ajouter des fichiers spécifiques
git add backend/app/Http/Controllers/MonController.php

# Créer un commit avec un message descriptif
git commit -m "Ajout de la fonctionnalité X"

# Pusher vers GitHub
git push origin main
```

---

## 📋 Messages de Commit Recommandés

Utilisez des messages clairs et descriptifs :

```bash
# Nouvelles fonctionnalités
git commit -m "feat: Ajout du système de paiement mobile money"

# Corrections de bugs
git commit -m "fix: Correction de l'erreur CORS sur la marketplace"

# Améliorations
git commit -m "improve: Optimisation des requêtes de collecte"

# Mise à jour de la documentation
git commit -m "docs: Ajout du guide de déploiement Render"

# Refactoring
git commit -m "refactor: Réorganisation des composants UI"

# Style/Design
git commit -m "style: Application du design premium sur les cards"
```

---

## 🐛 Dépannage

### Erreur : "fatal: not a git repository"

**Solution** : Vous n'êtes pas dans le bon dossier
```powershell
cd "c:\Users\USER\Documents\Projet DevWeb\sikagreen"
git init
```

### Erreur : "remote origin already exists"

**Solution** : Le remote existe déjà, supprimez-le et recréez-le
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/sikagreen.git
```

### Erreur : "failed to push some refs"

**Solution** : Quelqu'un a pushé avant vous, récupérez les changements
```powershell
git pull origin main --rebase
git push origin main
```

### Erreur : "Authentication failed"

**Solution** : Utilisez un Personal Access Token au lieu du mot de passe
- Voir section "Créer un Personal Access Token" ci-dessus

---

## ✅ Vérification

Après le push, vérifiez sur GitHub :

1. Allez sur `https://github.com/YOUR_USERNAME/sikagreen`
2. Vous devriez voir :
   - ✅ Dossiers `backend/` et `frontend/`
   - ✅ Fichiers `README.md`, `DEPLOYMENT.md`, etc.
   - ✅ Votre commit "Initial commit - SikaGreen Platform"

---

## 🎯 Prochaine Étape

Une fois le code sur GitHub, passez au déploiement Render :

👉 Consultez **RENDER_DEPLOYMENT_GUIDE.md** pour les instructions détaillées.

---

**Bon push ! 🚀**
