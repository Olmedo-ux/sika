import api from '@/lib/axios';
import type { 
  Collection, 
  Review, 
  MarketplaceProduct, 
  GlobalStats, 
  DashboardStats,
  WasteType,
  CollectionPoint
} from '@/types';

// Collections API
export const collectionsApi = {
  getAll: () => api.get<Collection[]>('/collections'),
  getCitizenCollections: () => api.get<Collection[]>('/collections/citizen'),
  getCollectorCollections: () => api.get<Collection[]>('/collections/collector'),
  getCollectorHistory: () => api.get<Collection[]>('/collections/collector/history'),
  create: (data: {
    waste_type: string;
    quantity: string;
    location_lat: number;
    location_lng: number;
    location_address: string;
    amount?: number;
  }) => api.post<Collection>('/collections', data),
  update: (id: string, data: { status?: string; collector_id?: string }) => 
    api.patch<Collection>(`/collections/${id}`, data),
  accept: (id: string) => api.post(`/collections/${id}/accept`),
  reject: (id: string) => api.post(`/collections/${id}/reject`),
  start: (id: string) => api.post(`/collections/${id}/start`),
};

// Reviews API
export const reviewsApi = {
  getReceived: () => api.get<Review[]>('/reviews/received'),
  getGiven: () => api.get<Review[]>('/reviews/given'),
  create: (data: {
    to_user_id: string;
    rating: number;
    badges?: string[];
    comment?: string;
  }) => api.post<Review>('/reviews', data),
};

// Marketplace API
export const marketplaceApi = {
  getProducts: () => api.get<MarketplaceProduct[]>('/marketplace/products'),
  getMyProducts: () => api.get<MarketplaceProduct[]>('/marketplace/my-products'),
  createProduct: (data: {
    product_type: 'raw_material' | 'finished_product';
    name: string;
    description: string;
    image_url?: string;
    image_urls?: string[];
    quantity: number;
    unit: string;
    price_per_unit: number;
    available?: boolean;
  }) => api.post<MarketplaceProduct>('/marketplace/products', data),
  updateProduct: (id: string, data: Partial<{
    product_type: 'raw_material' | 'finished_product';
    name: string;
    description: string;
    image_url?: string;
    image_urls?: string[];
    quantity: number;
    unit: string;
    price_per_unit: number;
    available: boolean;
  }>) => api.patch<MarketplaceProduct>(`/marketplace/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/marketplace/products/${id}`),
};

// Stats API
export const statsApi = {
  getGlobal: () => api.get<GlobalStats>('/stats/global'),
  getDashboard: () => api.get<DashboardStats>('/stats/dashboard'),
};

// Config API
export const configApi = {
  getWasteTypes: () => api.get<WasteType[]>('/waste-types'),
  getNeighborhoods: () => api.get<string[]>('/neighborhoods'),
  getCollectionPoints: () => api.get<CollectionPoint[]>('/collection-points'),
};

// Marketplace Orders API
export const marketplaceOrdersApi = {
  createOrder: (data: { product_id: string; quantity: number; message?: string; phone?: string }) => 
    api.post('/marketplace/orders', data),
  getMyOrders: () => api.get('/marketplace/orders/my-orders'),
  getReceivedOrders: () => api.get('/marketplace/orders/received'),
  acceptOrder: (id: string) => api.post(`/marketplace/orders/${id}/accept`),
  rejectOrder: (id: string) => api.post(`/marketplace/orders/${id}/reject`),
  completeOrder: (id: string) => api.post(`/marketplace/orders/${id}/complete`),
  cancelOrder: (id: string) => api.post(`/marketplace/orders/${id}/cancel`),
};

// Chat API
export const chatApi = {
  getConversations: () => api.get('/conversations'),
  createConversation: (otherUserId: string) => api.post('/conversations', { other_user_id: otherUserId }),
  getMessages: (conversationId: string) => api.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string, mediaType: 'text' | 'image' | 'audio' = 'text', mediaFile?: File) => {
    const formData = new FormData();
    if (content) formData.append('content', content);
    formData.append('media_type', mediaType);
    if (mediaFile) formData.append('media', mediaFile);
    
    return api.post(`/conversations/${conversationId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
