import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { marketplaceApi } from '@/services/api';
import type { MarketplaceProduct } from '@/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Package, Recycle, Edit, Trash2, Plus, Filter, Image as ImageIcon } from 'lucide-react';
import { AddProductDialog } from '@/components/dialogs/AddProductDialog';
import { EditProductDialog } from '@/components/dialogs/EditProductDialog';

export default function RecyclerMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch products for this recycler
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await marketplaceApi.getMyProducts();
        console.log('Products response:', response.data);
        // Gérer le format Laravel Resource: {data: [...]} ou direct [...]
        const productsData = Array.isArray(response.data) 
          ? response.data 
          : (Array.isArray((response.data as any)?.data) 
            ? (response.data as any).data 
            : []);
        console.log('Products data:', productsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les produits',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProducts();
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

  const handleEditProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setEditProductOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: MarketplaceProduct) => {
    try {
      await marketplaceApi.updateProduct(updatedProduct.id, {
        product_type: updatedProduct.productType,
        name: updatedProduct.name,
        description: updatedProduct.description,
        image_url: updatedProduct.imageUrl,
        image_urls: updatedProduct.imageUrls,
        quantity: updatedProduct.quantity,
        unit: updatedProduct.unit,
        price_per_unit: updatedProduct.pricePerUnit,
        available: updatedProduct.available
      });
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast({ title: 'Produit modifié', description: 'Les modifications ont été enregistrées' });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le produit',
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

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.productType === activeTab);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <ShoppingCart className="h-6 w-6 mr-2 text-primary" />
              Mes produits
            </h1>
            <p className="text-muted-foreground">Gérez vos produits sur la marketplace</p>
          </div>
          <Button 
            className="rounded-xl bg-primary"
            onClick={() => setAddProductOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="all" className="rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              Tout ({products.length})
            </TabsTrigger>
            <TabsTrigger value="raw_material" className="rounded-xl">
              <Recycle className="h-4 w-4 mr-2" />
              Matières
            </TabsTrigger>
            <TabsTrigger value="finished_product" className="rounded-xl">
              <Package className="h-4 w-4 mr-2" />
              Produits
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
                  <p className="text-muted-foreground mb-4">Aucun produit dans cette catégorie</p>
                  <Button onClick={() => setAddProductOpen(true)} className="rounded-xl bg-primary">
                    <Plus className="h-4 w-4 mr-2" /> Ajouter un produit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="rounded-xl overflow-hidden flex flex-col">
                    {/* Product Images */}
                    {(product.imageUrls?.length || product.imageUrl) ? (
                      <div className="relative h-40 bg-muted">
                        <img 
                          src={product.imageUrls?.[0] || product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.imageUrls && product.imageUrls.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {product.imageUrls.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {product.productType === 'raw_material' ? (
                          <Recycle className="h-12 w-12 text-primary" />
                        ) : (
                          <Package className="h-12 w-12 text-secondary" />
                        )}
                      </div>
                    )}
                    
                    <CardContent className="p-3 flex flex-col flex-1">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                        
                        <div className="flex items-center gap-1 mb-2 flex-wrap">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            {product.quantity} {product.unit}
                          </span>
                          <Badge variant={product.productType === 'raw_material' ? 'default' : 'secondary'} className="text-xs">
                            {product.productType === 'raw_material' ? 'Matière' : 'Produit'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-base font-bold text-primary">
                            {formatCurrency(product.pricePerUnit)} FCFA
                          </p>
                          <p className="text-xs text-muted-foreground">par {product.unit}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl flex-1 text-xs h-8"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-3 w-3 mr-1" /> Modifier
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-xl h-8 px-2"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />

      <AddProductDialog 
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onSubmit={handleAddProduct}
      />

      <EditProductDialog
        open={editProductOpen}
        onOpenChange={setEditProductOpen}
        product={selectedProduct}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}
