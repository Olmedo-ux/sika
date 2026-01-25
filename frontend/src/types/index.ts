// SikaGreen TypeScript Types

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'citizen' | 'collector' | 'recycler';
  neighborhood: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  wallet?: number;
  // For businesses (collector/recycler)
  companyName?: string;
  responsibleName?: string;
}

export interface Collection {
  id: string;
  citizenId: string;
  citizenName: string;
  collectorId?: string;
  collectorName?: string;
  wasteType: string;
  quantity: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date | string;
  completedAt?: Date | string;
  amount?: number;
  hasRated?: boolean;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  rating: number;
  badges: string[];
  comment?: string;
  createdAt: Date | string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date | string;
  seen: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: Date | string;
  unreadCount: number;
}

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: 'recycler';
  productType: 'raw_material' | 'finished_product';
  name: string;
  description: string;
  imageUrl?: string;
  imageUrls?: string[];
  quantity: number;
  unit: string;
  pricePerUnit: number;
  available: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Order {
  id: string;
  recyclerId: string;
  wasteType: string;
  targetQuantity: number;
  collectedQuantity: number;
  status: 'in_progress' | 'completed';
}

export interface WasteType {
  id: string;
  name: string;
  icon: string;
  pricePerKg: number;
  recyclable: boolean;
}

export interface CollectionPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'collection' | 'recycler';
  neighborhood?: string;
}

export interface GlobalStats {
  totalWasteRecycled: number;
  co2Avoided: number;
  familiesEngaged: number;
  activeCollectors: number;
}

export interface DashboardStats {
  pendingCollections?: number;
  completedThisMonth?: number;
  totalWeight?: number;
  totalEarnings?: number;
  totalSales?: number;
  totalRevenue?: number;
  activeProducts?: number;
  totalProducts?: number;
}
