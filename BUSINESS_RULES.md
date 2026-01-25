# Règles Métier - SikaGreen

## Système de Notation et Avis

### Règle Principale
**Seuls les utilisateurs ayant bénéficié d'un produit ou service peuvent noter l'entreprise concernée.**

---

## Détails par Type d'Utilisateur

### 1. Citoyens (Citizens)

**Peuvent noter :**
- ✅ **Collecteurs** : Uniquement après avoir bénéficié d'une collecte de déchets complétée
  - Condition : La collecte doit avoir le statut `completed`
  - Moment : Après la fin de la collecte
  - Critères : Ponctualité, professionnalisme, propreté, etc.

**Ne peuvent PAS noter :**
- ❌ Collecteurs sans avoir eu de collecte avec eux
- ❌ Recycleurs (pas de relation directe de service)
- ❌ Autres citoyens

---

### 2. Collecteurs (Collectors)

**Peuvent noter :**
- ✅ **Citoyens** : Uniquement après avoir complété une collecte chez eux
  - Condition : La collecte doit avoir le statut `completed`
  - Moment : Après la fin de la collecte
  - Critères : Respect du tri, accessibilité, ponctualité, etc.

- ✅ **Recycleurs** : Uniquement après avoir vendu/livré des déchets
  - Condition : La transaction/commande doit être complétée
  - Moment : Après la livraison/vente
  - Critères : Paiement rapide, professionnalisme, etc.

**Ne peuvent PAS noter :**
- ❌ Citoyens sans avoir fait de collecte chez eux
- ❌ Recycleurs sans transaction commerciale
- ❌ Autres collecteurs

---

### 3. Recycleurs (Recyclers)

**Peuvent noter :**
- ✅ **Collecteurs** : Uniquement après avoir acheté/reçu des déchets
  - Condition : La transaction/commande doit être complétée
  - Moment : Après la réception des matériaux
  - Critères : Qualité des matériaux, respect des délais, etc.

- ✅ **Acheteurs de produits** : Si un citoyen ou collecteur achète un produit recyclé
  - Condition : L'achat doit être complété
  - Moment : Après la livraison du produit
  - Critères : Qualité du produit, emballage, etc.

**Ne peuvent PAS noter :**
- ❌ Collecteurs sans transaction commerciale
- ❌ Citoyens (pas de relation directe de service)
- ❌ Autres recycleurs

---

## Implémentation Technique

### Vérifications Requises

Avant d'afficher le bouton de notation ou le `RatingDialog`, vérifier :

1. **Relation de service existe** :
   ```typescript
   // Pour Citoyen → Collecteur
   const hasCompletedCollection = collections.some(
     c => c.citizenId === currentUser.id && 
          c.collectorId === targetUser.id && 
          c.status === 'completed'
   );
   
   // Pour Collecteur → Recycleur
   const hasCompletedTransaction = orders.some(
     o => o.collectorId === currentUser.id && 
          o.recyclerId === targetUser.id && 
          o.status === 'completed'
   );
   ```

2. **Pas de notation en double** :
   - Un utilisateur ne peut noter qu'une seule fois par transaction/collecte
   - Possibilité de modifier sa note dans un délai défini (ex: 7 jours)

3. **Statut de la transaction** :
   - Uniquement les transactions avec statut `completed`
   - Pas de notation pour les transactions `pending`, `cancelled`, ou `in_progress`

---

## Flux de Notation

### Scénario 1 : Citoyen note un Collecteur

1. Citoyen demande une collecte
2. Collecteur accepte et effectue la collecte
3. Collecteur marque la collecte comme terminée
4. **→ Citoyen reçoit une notification pour noter le collecteur**
5. Citoyen ouvre le `RatingDialog` et soumet son avis
6. La note est ajoutée au profil du collecteur

### Scénario 2 : Collecteur note un Citoyen

1. Collecteur termine une collecte
2. **→ Collecteur peut immédiatement noter le citoyen**
3. Collecteur ouvre le `RatingDialog` et soumet son avis
4. La note est ajoutée au profil du citoyen

### Scénario 3 : Collecteur note un Recycleur

1. Collecteur livre des déchets à un recycleur
2. Recycleur confirme la réception et le paiement
3. Transaction marquée comme `completed`
4. **→ Collecteur peut noter le recycleur**
5. La note est ajoutée au profil du recycleur

### Scénario 4 : Recycleur note un Collecteur

1. Recycleur reçoit des matériaux d'un collecteur
2. Recycleur confirme la qualité et effectue le paiement
3. Transaction marquée comme `completed`
4. **→ Recycleur peut noter le collecteur**
5. La note est ajoutée au profil du collecteur

---

## Règles Complémentaires

### Délai de Notation
- **Fenêtre de notation** : 30 jours après la fin du service
- **Modification** : Possible dans les 7 jours suivant la notation initiale
- **Suppression** : Impossible (seulement modification)

### Modération
- Les avis avec langage inapproprié sont signalés
- Les notes extrêmes (1 ou 5 étoiles) sans commentaire peuvent être vérifiées
- Les utilisateurs peuvent signaler des avis abusifs

### Impact sur le Profil
- **Note moyenne** : Calculée sur les 12 derniers mois
- **Nombre d'avis** : Affiché publiquement
- **Badges** : Attribués automatiquement selon les avis reçus
  - Ex: "Ponctuel" si 80% des avis mentionnent ce badge

---

## Exemples de Cas Limites

### ❌ Cas Invalides

1. **Citoyen A veut noter Collecteur B**
   - Mais n'a jamais eu de collecte avec B
   - → **Notation refusée**

2. **Collecteur C veut noter Recycleur D**
   - Mais n'a jamais livré de déchets à D
   - → **Notation refusée**

3. **Citoyen E veut noter Recycleur F**
   - Même s'il a acheté un produit sur la marketplace
   - → **Notation autorisée** (car achat = service)

### ✅ Cas Valides

1. **Citoyen A a eu 3 collectes avec Collecteur B**
   - → Peut noter B après chaque collecte complétée
   - Chaque note est liée à une collecte spécifique

2. **Collecteur C livre régulièrement à Recycleur D**
   - → Peut noter D après chaque transaction complétée

---

## Résumé

| Utilisateur | Peut noter | Condition |
|-------------|-----------|-----------|
| **Citoyen** | Collecteur | Collecte complétée |
| **Citoyen** | Recycleur | Produit acheté et livré |
| **Collecteur** | Citoyen | Collecte complétée |
| **Collecteur** | Recycleur | Matériaux livrés et payés |
| **Recycleur** | Collecteur | Matériaux reçus et payés |
| **Recycleur** | Acheteur | Produit vendu et livré |

**Principe clé** : Pas de service = Pas de notation
