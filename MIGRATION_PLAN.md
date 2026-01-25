# 🚀 PLAN DE MIGRATION : Mock Data → API Backend

## 📊 ÉTAPE 1 : CARTOGRAPHIE DES DONNÉES MOCK

### Interfaces TypeScript (à conserver)
- ✅ `User` - Déjà géré par UserResource
- ✅ `Collection` - À créer dans Backend
- ✅ `Review` - À créer dans Backend
- ✅ `ChatMessage` - À créer dans Backend
- ✅ `Conversation` - À créer dans Backend
- ✅ `MarketplaceProduct` - À créer dans Backend
- ✅ `Order` - À créer dans Backend

### Données Mock à Remplacer

#### 1. **mockUsers** (lignes 97-128)
- ❌ À SUPPRIMER - Remplacé par `/api/user` (déjà fait)

#### 2. **wasteTypes** (lignes 133-144)
- 🔄 Données statiques de configuration
- **Action**: Créer endpoint `/api/waste-types`
- **Backend**: Créer table `waste_types` ou retourner config statique

#### 3. **neighborhoods** (lignes 147-156)
- 🔄 Données statiques de configuration
- **Action**: Créer endpoint `/api/neighborhoods`
- **Backend**: Retourner liste des quartiers

#### 4. **collectionPoints** (lignes 159-164)
- 🔄 Points de collecte sur la carte
- **Action**: Créer endpoint `/api/collection-points`
- **Backend**: Retourner users (collectors/recyclers) avec coordonnées GPS

#### 5. **mockCollections** (lignes 167-206)
- 🔴 PRIORITÉ HAUTE
- **Action**: Créer endpoints:
  - `GET /api/collections` - Toutes les collectes de l'utilisateur
  - `GET /api/collections/citizen` - Collectes du citoyen
  - `GET /api/collections/collector` - Collectes du collecteur
  - `POST /api/collections` - Créer une collecte
  - `PATCH /api/collections/{id}` - Mettre à jour statut

#### 6. **mockReviews** (lignes 209-229)
- 🔴 PRIORITÉ HAUTE
- **Action**: Créer endpoints:
  - `GET /api/reviews/received` - Avis reçus
  - `POST /api/reviews` - Créer un avis

#### 7. **mockConversations** (lignes 232-249)
- 🟡 PRIORITÉ MOYENNE
- **Action**: Créer endpoints:
  - `GET /api/conversations` - Liste des conversations
  - `GET /api/conversations/{id}/messages` - Messages d'une conversation

#### 8. **mockMessages** (lignes 252-280)
- 🟡 PRIORITÉ MOYENNE
- **Action**: Intégré avec conversations

#### 9. **mockMarketplaceProducts** (lignes 283-340)
- 🔴 PRIORITÉ HAUTE
- **Action**: Créer endpoints:
  - `GET /api/marketplace/products` - Tous les produits
  - `GET /api/marketplace/my-products` - Mes produits (recycler)
  - `POST /api/marketplace/products` - Créer un produit
  - `PATCH /api/marketplace/products/{id}` - Modifier un produit
  - `DELETE /api/marketplace/products/{id}` - Supprimer un produit

#### 10. **mockOrders** (lignes 343-360)
- 🟡 PRIORITÉ MOYENNE
- **Action**: Créer endpoints:
  - `GET /api/orders` - Commandes du recycleur

#### 11. **quickReplies** (lignes 363-369)
- 🟢 PRIORITÉ BASSE - Données statiques UI
- **Action**: Garder en frontend (pas besoin d'API)

#### 12. **collectorBadges / citizenBadges** (lignes 372-373)
- 🟢 PRIORITÉ BASSE - Données statiques UI
- **Action**: Garder en frontend (pas besoin d'API)

#### 13. **sortingTips** (lignes 376-401)
- 🟢 PRIORITÉ BASSE - Contenu éditorial
- **Action**: Garder en frontend OU créer `/api/tips` si contenu dynamique souhaité

#### 14. **climateImpactStats** (lignes 404-409)
- 🔴 PRIORITÉ HAUTE - Statistiques dynamiques
- **Action**: Créer endpoint `/api/stats/global`
- **Backend**: Calculer depuis la BDD (SUM collections, COUNT users, etc.)

#### 15. **testimonials** (lignes 412-440)
- 🟡 PRIORITÉ MOYENNE - Contenu éditorial
- **Action**: Garder en frontend OU créer `/api/testimonials` si gestion admin souhaitée

---

## 🗂️ ÉTAPE 2 : ROUTES BACKEND À CRÉER

### Routes Prioritaires (À faire en premier)

```php
// backend/routes/api.php

// Collections
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/collections/citizen', [CollectionController::class, 'citizenCollections']);
    Route::get('/collections/collector', [CollectionController::class, 'collectorCollections']);
    Route::post('/collections', [CollectionController::class, 'store']);
    Route::patch('/collections/{id}', [CollectionController::class, 'update']);
});

// Reviews
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reviews/received', [ReviewController::class, 'received']);
    Route::post('/reviews', [ReviewController::class, 'store']);
});

// Marketplace
Route::get('/marketplace/products', [MarketplaceController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/marketplace/my-products', [MarketplaceController::class, 'myProducts']);
    Route::post('/marketplace/products', [MarketplaceController::class, 'store']);
    Route::patch('/marketplace/products/{id}', [MarketplaceController::class, 'update']);
    Route::delete('/marketplace/products/{id}', [MarketplaceController::class, 'destroy']);
});

// Stats
Route::get('/stats/global', [StatsController::class, 'global']);
Route::middleware('auth:sanctum')->get('/stats/dashboard', [StatsController::class, 'dashboard']);

// Configuration
Route::get('/waste-types', [ConfigController::class, 'wasteTypes']);
Route::get('/neighborhoods', [ConfigController::class, 'neighborhoods']);
Route::get('/collection-points', [ConfigController::class, 'collectionPoints']);
```

---

## 📁 ÉTAPE 3 : STRUCTURE BACKEND

### Modèles à créer

1. **Collection** (table: collections)
```php
- id
- citizen_id (FK users)
- collector_id (FK users, nullable)
- waste_type
- quantity
- status (enum: pending, accepted, in_progress, completed, cancelled)
- location_lat
- location_lng
- location_address
- amount (nullable)
- created_at
- completed_at (nullable)
```

2. **Review** (table: reviews)
```php
- id
- from_user_id (FK users)
- to_user_id (FK users)
- rating (1-5)
- badges (JSON)
- comment (nullable)
- created_at
```

3. **MarketplaceProduct** (table: marketplace_products)
```php
- id
- seller_id (FK users)
- product_type (enum: raw_material, finished_product)
- name
- description
- image_url (nullable)
- image_urls (JSON, nullable)
- quantity
- unit
- price_per_unit
- available (boolean)
- created_at
- updated_at
```

4. **Order** (table: orders)
```php
- id
- recycler_id (FK users)
- waste_type
- target_quantity
- collected_quantity
- status (enum: in_progress, completed)
- created_at
```

---

## 🔧 ÉTAPE 4 : SERVICE API FRONTEND

### Créer `frontend/src/services/api.ts`

```typescript
import api from '@/lib/axios';
import type { Collection, Review, MarketplaceProduct, Order } from '@/types';

// Collections
export const collectionsApi = {
  getAll: () => api.get<Collection[]>('/collections'),
  getCitizenCollections: () => api.get<Collection[]>('/collections/citizen'),
  getCollectorCollections: () => api.get<Collection[]>('/collections/collector'),
  create: (data: any) => api.post<Collection>('/collections', data),
  update: (id: string, data: any) => api.patch<Collection>(`/collections/${id}`, data),
};

// Reviews
export const reviewsApi = {
  getReceived: () => api.get<Review[]>('/reviews/received'),
  create: (data: any) => api.post<Review>('/reviews', data),
};

// Marketplace
export const marketplaceApi = {
  getProducts: () => api.get<MarketplaceProduct[]>('/marketplace/products'),
  getMyProducts: () => api.get<MarketplaceProduct[]>('/marketplace/my-products'),
  createProduct: (data: any) => api.post<MarketplaceProduct>('/marketplace/products', data),
  updateProduct: (id: string, data: any) => api.patch<MarketplaceProduct>(`/marketplace/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/marketplace/products/${id}`),
};

// Stats
export const statsApi = {
  getGlobal: () => api.get('/stats/global'),
  getDashboard: () => api.get('/stats/dashboard'),
};

// Config
export const configApi = {
  getWasteTypes: () => api.get('/waste-types'),
  getNeighborhoods: () => api.get('/neighborhoods'),
  getCollectionPoints: () => api.get('/collection-points'),
};
```

---

## 📄 ÉTAPE 5 : MIGRATION PAGE PAR PAGE

### Ordre de migration

1. ✅ **Landing.tsx** - Stats globales + Testimonials
2. ✅ **Marketplace.tsx** - Produits marketplace
3. ✅ **CollectorDashboard.tsx** - Collections du collecteur
4. ✅ **CitizenDashboard.tsx** - Collections + Reviews du citoyen
5. ✅ **RecyclerDashboard.tsx** - Produits + Orders
6. ✅ **CitizenHistory.tsx** - Historique des collectes
7. ✅ **InteractiveMap.tsx** - Points de collecte
8. ✅ **NewCollection.tsx** - Waste types
9. ✅ **Auth.tsx** - Neighborhoods
10. ✅ **Chat.tsx** - Conversations (si temps)

---

## 🎯 CRITÈRES DE SUCCÈS

- [ ] Toutes les pages chargent les données depuis l'API
- [ ] Aucune référence à `mock-data.ts` dans le code
- [ ] Gestion des états vides (EmptyState)
- [ ] Gestion des erreurs API
- [ ] États de chargement (loading)
- [ ] Le fichier `mock-data.ts` est supprimé
- [ ] Les interfaces TypeScript sont déplacées vers `frontend/src/types/`

---

## ⚠️ POINTS D'ATTENTION

1. **Mapping des données** : Laravel renvoie `snake_case`, TypeScript attend `camelCase`
2. **Dates** : Laravel renvoie des strings ISO, TypeScript peut attendre des Date objects
3. **Images** : Gérer les URLs absolues vs relatives
4. **Pagination** : Prévoir la pagination pour les listes longues
5. **Cache** : Considérer React Query pour le cache et la gestion d'état
