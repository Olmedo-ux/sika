// SikaGreen Mock Data - Données de démonstration

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
  createdAt: Date;
  completedAt?: Date;
  amount?: number;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  rating: number;
  badges: string[];
  comment?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  seen: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

// Marketplace - Products created by Recyclers
export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: 'recycler';
  productType: 'raw_material' | 'finished_product';
  name: string;
  description: string;
  imageUrl?: string;
  imageUrls?: string[]; // Multiple images support
  quantity: number;
  unit: string;
  pricePerUnit: number;
  available: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  recyclerId: string;
  wasteType: string;
  targetQuantity: number;
  collectedQuantity: number;
  status: 'in_progress' | 'completed';
}

// Users - No test data, users will be created via registration
export const mockUsers: User[] = [];

// Waste Types
// recyclable: true = matières recyclables (pour recycleurs via marketplace)
// recyclable: false = déchets non recyclables (collecte par collecteurs pour citoyens)
export const wasteTypes = [
  { id: 'plastic', name: 'Plastique', icon: '♻️', pricePerKg: 150, recyclable: true },
  { id: 'glass', name: 'Verre', icon: '🫙', pricePerKg: 100, recyclable: true },
  { id: 'metal', name: 'Métal', icon: '🔩', pricePerKg: 250, recyclable: true },
  { id: 'organic', name: 'Organique', icon: '🌿', pricePerKg: 50, recyclable: false },
  { id: 'paper', name: 'Papier/Carton', icon: '📦', pricePerKg: 80, recyclable: true },
  { id: 'electronics', name: 'Électronique', icon: '📱', pricePerKg: 500, recyclable: true },
  { id: 'banana', name: 'Troncs de bananier', icon: '🍌', pricePerKg: 120, recyclable: true },
  { id: 'household', name: 'Ordures ménagères', icon: '🗑️', pricePerKg: 30, recyclable: false },
  { id: 'garden', name: 'Déchets verts', icon: '🌳', pricePerKg: 40, recyclable: false },
  { id: 'mixed', name: 'Déchets mixtes', icon: '🧹', pricePerKg: 25, recyclable: false },
];

// Neighborhoods
export const neighborhoods = [
  'Lomé Centre',
  'Bè',
  'Agoè-Nyivé',
  'Tokoin',
  'Kodjoviakopé',
  'Adidogomé',
  'Baguida',
  'Aflao',
];

// Collection Points - No test data (fetched from API)
export const collectionPoints: Array<{ id: string; name: string; lat: number; lng: number; type: string }> = [];

// Collections - No test data
export const mockCollections: Collection[] = [];

// Reviews - No test data
export const mockReviews: Review[] = [];

// Conversations - No test data
export const mockConversations: Conversation[] = [];

// Chat Messages - No test data
export const mockMessages: ChatMessage[] = [];

// Marketplace Products - No test data
export const mockMarketplaceProducts: MarketplaceProduct[] = [];

// Orders - No test data
export const mockOrders: Order[] = [];

// Quick Reply Options
export const quickReplies = [
  "J'arrive",
  'OK pour 14h',
  'Merci',
  "C'est noté",
  'À demain',
];

// Rating Badges
export const collectorBadges = ['Ponctuel', 'Professionnel', 'Sympa', 'Rapide'];
export const citizenBadges = ['Bien trié', 'Facile à trouver', 'Généreux', 'Régulier'];

// Sorting Tips for Landing Page
export const sortingTips = [
  {
    id: 'tip-1',
    icon: '♻️',
    title: 'Plastique',
    tip: 'Rincez les bouteilles et retirez les bouchons. Écrasez-les pour gagner de la place.',
  },
  {
    id: 'tip-2',
    icon: '🫙',
    title: 'Verre',
    tip: 'Ne mélangez pas le verre avec la céramique ou les miroirs. Ils ont des compositions différentes.',
  },
  {
    id: 'tip-3',
    icon: '📦',
    title: 'Carton',
    tip: 'Aplatissez vos cartons et retirez le scotch. Le carton mouillé peut encore être recyclé.',
  },
  {
    id: 'tip-4',
    icon: '🌿',
    title: 'Organique',
    tip: 'Les épluchures et restes alimentaires font un excellent compost pour votre jardin.',
  },
];

// Climate Impact Stats
export const climateImpactStats = [
  { value: '15,000', label: 'kg de déchets recyclés', icon: '♻️' },
  { value: '8,500', label: 'kg de CO₂ évités', icon: '🌍' },
  { value: '2,300', label: 'familles engagées', icon: '👨‍👩‍👧‍👦' },
  { value: '45', label: 'collecteurs actifs', icon: '🚴' },
];

// Testimonials for Landing Page
export const testimonials = [
  {
    id: 't-1',
    name: 'Marie Afiwa',
    role: 'Citoyenne',
    neighborhood: 'Tokoin',
    content: 'Grâce à SikaGreen, je gagne de l\'argent en recyclant mes déchets. C\'est simple et rapide !',
    rating: 5,
    avatar: '👩🏾',
  },
  {
    id: 't-2',
    name: 'EcoCollect Togo',
    role: 'Entreprise de collecte',
    neighborhood: 'Bè',
    content: 'Cette application a transformé notre activité. Nous gagnons mieux notre vie tout en protégeant l\'environnement.',
    rating: 5,
    avatar: '🚴',
  },
  {
    id: 't-3',
    name: 'TogoRecycle SA',
    role: 'Entreprise de recyclage',
    neighborhood: 'Zone Industrielle',
    content: 'Un approvisionnement régulier en matières premières de qualité. Excellent partenariat !',
    rating: 5,
    avatar: '🏭',
  },
];
