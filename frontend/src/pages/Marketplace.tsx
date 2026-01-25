import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderDialog } from '@/components/dialogs/OrderDialog';
import type { MarketplaceProduct } from '@/types';
import { marketplaceApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Package, Recycle, MessageSquare, Filter, HandCoins, Tag } from 'lucide-react';
import api from '@/lib/axios';

export default function Marketplace() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/marketplace-products');
        console.log('Marketplace response:', response.data);
        
        // Gérer le format Laravel Resource: {data: [...]} ou direct [...]
        let productsData = Array.isArray(response.data) 
          ? response.data 
          : (Array.isArray((response.data as any)?.data) 
            ? (response.data as any).data 
            : []);
        
        console.log('Products data:', productsData);
        
        // Map to MarketplaceProduct format (data is already in camelCase from Resource)
        const mappedProducts: MarketplaceProduct[] = productsData.map((product: any) => {
          console.log('Product price data:', {
            name: product.name,
            productType: product.productType,
            pricePerUnit: product.pricePerUnit,
            priceType: typeof product.pricePerUnit
          });
          
          return {
            id: product.id,
            sellerId: product.sellerId,
            sellerName: product.sellerName,
            sellerType: product.sellerType,
            productType: product.productType,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            imageUrls: product.imageUrls,
            quantity: product.quantity,
            unit: product.unit,
            pricePerUnit: Number(product.pricePerUnit) || 0,
            available: product.available,
            createdAt: new Date(product.createdAt),
            updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
          };
        });
        
        console.log('Mapped products:', mappedProducts);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching marketplace products:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les produits',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Determine user role
  const isRecycler = user?.role === 'recycler';
  const isCitizen = user?.role === 'citizen';
  const isCollector = user?.role === 'collector';

  // Handle action based on product type
  // raw_material = Recycler wants to BUY → Citizens/Collectors can SELL
  // finished_product = Recycler wants to SELL → Citizens/Collectors can BUY
  const handleAction = (product: MarketplaceProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({ 
        title: 'Connexion requise', 
        description: 'Veuillez vous connecter pour continuer',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (isRecycler) {
      toast({ 
        title: 'Action non autorisée', 
        description: 'Gérez vos produits depuis votre espace recycleur',
        variant: 'destructive'
      });
      navigate('/dashboard/recycler/marketplace');
      return;
    }

    setSelectedProduct(product);
    setOrderDialogOpen(true);
  };

  const handleContact = async (product: MarketplaceProduct) => {
    if (!isAuthenticated) {
      toast({ 
        title: 'Connexion requise', 
        description: 'Veuillez vous connecter pour contacter le recycleur',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    try {
      // Créer ou récupérer la conversation avec le vendeur
      const response = await api.post('/conversations', { other_user_id: product.sellerId });
      const conversationId = response.data.id;
      
      // Rediriger vers le chat avec cette conversation ouverte
      navigate(`/chat?conversation=${conversationId}`);
      
      toast({ 
        title: 'Discussion ouverte', 
        description: `Vous pouvez maintenant discuter avec ${product.sellerName}`
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'ouvrir la discussion',
        variant: 'destructive'
      });
    }
  };

  // Get action button text based on product type
  const getActionButtonText = (product: MarketplaceProduct) => {
    if (product.productType === 'raw_material') {
      return { full: 'Vendre', short: 'Vendre', icon: HandCoins };
    }
    return { full: 'Acheter', short: 'Achat', icon: ShoppingCart };
  };

  // Get price label based on product type
  const getPriceLabel = (product: MarketplaceProduct) => {
    if (product.productType === 'raw_material') {
      return 'Prix d\'achat'; // Recycler buys at this price
    }
    return 'Prix de vente'; // Recycler sells at this price
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0';
    }
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.productType === activeTab);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        {isAuthenticated && (
          <>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary shrink-0" />
                Marketplace
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isRecycler 
                  ? 'Gérez vos offres depuis votre espace recycleur' 
                  : 'Vendez vos matières ou achetez des produits recyclés'}
              </p>
            </div>

            {/* Info banner explaining marketplace logic for citizens and collectors */}
            {!isRecycler && (
              <Card className="rounded-xl bg-muted/50 border-muted">
                <CardContent className="py-3 px-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span><strong>Matières premières :</strong> Vendez aux recycleurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                      <span><strong>Produits finis :</strong> Achetez des produits recyclés</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 rounded-xl h-auto p-1">
            <TabsTrigger value="all" className="rounded-xl text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tout</span>
            </TabsTrigger>
            <TabsTrigger value="raw_material" className="rounded-xl text-xs sm:text-sm py-2 px-1 sm:px-3">
              <HandCoins className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Demandes d'achat</span>
              <span className="sm:hidden">Vendre</span>
            </TabsTrigger>
            <TabsTrigger value="finished_product" className="rounded-xl text-xs sm:text-sm py-2 px-1 sm:px-3">
              <Tag className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Offres de vente</span>
              <span className="sm:hidden">Acheter</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <Card className="rounded-xl">
                <CardContent className="py-12 text-center">
                  <div className="animate-spin h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
                  <p className="text-muted-foreground">Chargement des produits...</p>
                </CardContent>
              </Card>
            ) : filteredProducts.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun produit disponible dans cette catégorie</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all flex flex-col w-full"
                    onClick={() => navigate(`/marketplace/${product.id}`)}
                  >
                    {/* Product Image */}
                    {(product.imageUrls?.length || product.imageUrl) ? (
                      <div className="relative h-32 sm:h-40 bg-muted">
                        <img 
                          src={product.imageUrls?.[0] || product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {product.productType === 'raw_material' ? (
                          <Recycle className="h-8 w-8 sm:h-12 sm:w-12 text-primary/50" />
                        ) : (
                          <Package className="h-8 w-8 sm:h-12 sm:w-12 text-secondary/50" />
                        )}
                      </div>
                    )}
                    <CardContent className="p-2 sm:p-3 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {product.productType === 'raw_material' ? 'Acheteur: ' : 'Vendeur: '}
                            {product.sellerName}
                          </p>
                        </div>
                        <Badge 
                          variant={product.productType === 'raw_material' ? 'default' : 'secondary'} 
                          className="rounded-md text-[10px] shrink-0 px-1.5 py-0.5"
                        >
                          {product.productType === 'raw_material' ? 'Demande' : 'Offre'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">{getPriceLabel(product)}</p>
                          <span className="text-base sm:text-lg font-bold text-primary">
                            {formatCurrency(product.pricePerUnit)}
                          </span>
                          <span className="text-xs text-muted-foreground"> FCFA/{product.unit}</span>
                        </div>
                        <span className="text-[10px] bg-muted px-2 py-1 rounded-md whitespace-nowrap font-medium">
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                      <div className="flex gap-1 sm:gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-lg flex-1 text-xs min-h-[36px]"
                          onClick={() => handleContact(product)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 sm:mr-1.5" /> 
                          <span className="hidden sm:inline">Chat</span>
                        </Button>
                        {/* Action buttons for citizens and collectors (not recyclers) */}
                        {!isRecycler && (() => {
                          const actionBtn = getActionButtonText(product);
                          const ActionIcon = actionBtn.icon;
                          return (
                            <Button 
                              size="sm" 
                              className={`rounded-lg flex-1 text-xs min-h-[36px] ${
                                product.productType === 'raw_material' 
                                  ? 'bg-primary hover:bg-primary/90' 
                                  : 'bg-secondary hover:bg-secondary/90'
                              }`}
                              onClick={(e) => handleAction(product, e)}
                            >
                              <ActionIcon className="h-3 w-3 sm:mr-1" /> 
                              <span className="hidden sm:inline">{actionBtn.short}</span>
                            </Button>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="rounded-xl bg-primary/10 border-primary/20">
            <CardContent className="py-6 text-center">
              <h3 className="font-semibold mb-2">Vous voulez vendre vos produits ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Inscrivez-vous en tant qu'entreprise de recyclage pour publier vos produits.
              </p>
              <Button onClick={() => navigate('/auth?tab=register')} className="rounded-xl bg-primary">
                Créer un compte entreprise
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedProduct && (
        <OrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          product={selectedProduct}
        />
      )}

      <BottomNav />
    </div>
  );
}
