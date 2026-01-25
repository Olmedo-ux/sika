import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { marketplaceApi, statsApi } from '@/services/api';
import type { MarketplaceProduct } from '@/types';
import { ShoppingCart, TrendingUp, Plus, Package, Recycle, Edit, Trash2, Factory } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AddProductDialog } from '@/components/dialogs/AddProductDialog';

export default function RecyclerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0 });

  // Fetch products and stats for this recycler
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, statsRes] = await Promise.all([
          marketplaceApi.getMyProducts(),
          statsApi.getDashboard()
        ]);
        // Gérer le format Laravel Resource: {data: [...]} ou direct [...]
        const productsData = Array.isArray(productsRes.data) 
          ? productsRes.data 
          : (Array.isArray((productsRes.data as any)?.data) 
            ? (productsRes.data as any).data 
            : []);
        setProducts(productsData);
        setStats({
          totalSales: statsRes.data.totalSales || 0,
          totalRevenue: statsRes.data.totalRevenue || 0
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await marketplaceApi.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({ title: 'Produit supprimé', description: 'Le produit a été retiré de la marketplace' });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le produit',
        variant: 'destructive'
      });
    }
  };

  const handleAddProduct = async (newProduct: Omit<MarketplaceProduct, 'id' | 'sellerId' | 'sellerName' | 'sellerType' | 'createdAt'>) => {
    try {
      const response = await marketplaceApi.createProduct({
        product_type: newProduct.productType,
        name: newProduct.name,
        description: newProduct.description,
        image_url: newProduct.imageUrl,
        image_urls: newProduct.imageUrls,
        quantity: newProduct.quantity,
        unit: newProduct.unit,
        price_per_unit: newProduct.pricePerUnit,
        available: newProduct.available
      });
      setProducts(prev => [response.data, ...prev]);
      toast({ title: 'Produit ajouté !', description: 'Votre produit est maintenant visible sur la marketplace' });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le produit',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

  const companyName = user?.companyName || user?.name || 'Mon Entreprise';
  const responsibleName = user?.responsibleName || user?.name || 'Responsable';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        {/* Company Header */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-primary/20">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={companyName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10 text-primary rounded-xl">
              <Factory className="h-6 w-6 sm:h-8 sm:w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">{companyName}</h1>
            <p className="text-sm text-muted-foreground truncate">Responsable: {responsibleName}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.neighborhood || 'Zone Industrielle'}, Lomé</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="rounded-xl">
            <CardContent className="pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{products.length}</p>
              <p className="text-xs text-muted-foreground">Produits</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-secondary">{stats.totalSales}</p>
              <p className="text-xs text-muted-foreground">Ventes</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">FCFA</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Product Button */}
        <Button 
          className="w-full rounded-xl bg-primary h-12 sm:h-14 text-base sm:text-lg"
          onClick={() => setAddProductOpen(true)}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter un produit
        </Button>

        {/* My Products */}
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-secondary" />
              Mes produits en vente
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl"
              onClick={() => navigate('/marketplace')}
            >
              Voir tout
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Chargement...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucun produit en vente</p>
                <Button onClick={() => setAddProductOpen(true)} className="rounded-xl bg-primary">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter mon premier produit
                </Button>
              </div>
            ) : (
              products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-xl gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {product.productType === 'raw_material' ? (
                        <Recycle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      ) : (
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">{product.quantity} {product.unit}</span>
                        <Badge variant={product.productType === 'raw_material' ? 'default' : 'secondary'} className="text-[10px]">
                          {product.productType === 'raw_material' ? 'Brut' : 'Fini'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-primary text-base">{formatCurrency(product.pricePerUnit)}</p>
                      <p className="text-xs text-muted-foreground">FCFA/{product.unit}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />

      <AddProductDialog 
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onSubmit={handleAddProduct}
      />
    </div>
  );
}
