import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { marketplaceOrdersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Package, Check, X, Clock, CheckCircle2 } from 'lucide-react';

interface MarketplaceOrder {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  product_name: string;
  product_type: 'raw_material' | 'finished_product';
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_amount: number;
  buyer_message?: string;
  buyer_phone?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  buyer: {
    id: string;
    name: string;
    role: string;
  };
}

export default function RecyclerOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed'>('pending');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await marketplaceOrdersApi.getReceivedOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await marketplaceOrdersApi.acceptOrder(orderId);
      toast({
        title: 'Commande acceptée',
        description: 'Le client sera notifié'
      });
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accepter la commande',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await marketplaceOrdersApi.rejectOrder(orderId);
      toast({
        title: 'Commande refusée',
        description: 'Le client sera notifié'
      });
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de refuser la commande',
        variant: 'destructive'
      });
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      await marketplaceOrdersApi.completeOrder(orderId);
      toast({
        title: 'Commande terminée',
        description: 'La transaction est complétée'
      });
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer la commande',
        variant: 'destructive'
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'accepted') return order.status === 'accepted';
    if (activeTab === 'completed') return order.status === 'completed';
    return false;
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
            Commandes reçues
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos demandes d'achat et de vente
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="pending" className="rounded-xl">
              <Clock className="h-4 w-4 mr-2" />
              En attente ({orders.filter(o => o.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="rounded-xl">
              <Check className="h-4 w-4 mr-2" />
              Acceptées ({orders.filter(o => o.status === 'accepted').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Terminées ({orders.filter(o => o.status === 'completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <Card className="rounded-xl">
                <CardContent className="py-12 text-center">
                  <div className="animate-spin h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
                  <p className="text-muted-foreground">Chargement...</p>
                </CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune commande dans cette catégorie</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="rounded-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{order.product_name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.product_type === 'raw_material' ? 'Vente de matière' : 'Achat de produit'}
                          </p>
                        </div>
                        <Badge variant={
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'accepted' ? 'default' :
                          'outline'
                        }>
                          {order.status === 'pending' ? 'En attente' :
                           order.status === 'accepted' ? 'Acceptée' :
                           'Terminée'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Client</p>
                          <p className="font-medium">{order.buyer.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Quantité</p>
                          <p className="font-medium">{order.quantity} {order.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Prix unitaire</p>
                          <p className="font-medium">{order.price_per_unit.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Total</p>
                          <p className="font-bold text-primary">{order.total_amount.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>

                      {order.buyer_phone && (
                        <div>
                          <p className="text-muted-foreground text-xs">Téléphone</p>
                          <p className="font-medium">{order.buyer_phone}</p>
                        </div>
                      )}

                      {order.buyer_message && (
                        <div>
                          <p className="text-muted-foreground text-xs">Message du client</p>
                          <p className="text-sm bg-muted/50 p-2 rounded-lg">{order.buyer_message}</p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Reçue le {formatDate(order.created_at)}
                      </div>

                      {order.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl"
                            onClick={() => handleReject(order.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Refuser
                          </Button>
                          <Button
                            className="flex-1 rounded-xl"
                            onClick={() => handleAccept(order.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accepter
                          </Button>
                        </div>
                      )}

                      {order.status === 'accepted' && (
                        <Button
                          className="w-full rounded-xl"
                          onClick={() => handleComplete(order.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marquer comme terminée
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}
