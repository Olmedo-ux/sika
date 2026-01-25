import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { collectionsApi } from '@/services/api';
import type { Collection } from '@/types';
import { History, MapPin, Calendar, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CollectorHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await collectionsApi.getCollectorHistory();
        const collectionsData = Array.isArray((response.data as any)?.data) 
          ? (response.data as any).data 
          : (Array.isArray(response.data) ? response.data : []);
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'historique',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <History className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
            Historique des collectes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Toutes vos collectes terminées
          </p>
        </div>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">
              Collectes complétées ({collections.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Chargement...</p>
            ) : collections.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune collecte terminée</p>
              </div>
            ) : (
              collections.map((collection) => (
                <Card key={collection.id} className="rounded-xl bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{collection.citizenName}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{collection.location.address}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        Terminée
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Type de déchet</p>
                        <p className="font-medium">{collection.wasteType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Quantité</p>
                        <p className="font-medium">{collection.quantity}</p>
                      </div>
                    </div>

                    {collection.amount && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Montant</p>
                        <p className="text-lg font-bold text-primary">
                          {collection.amount.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                      <Calendar className="h-3 w-3" />
                      <span>Complétée le {formatDate((collection.completedAt || collection.createdAt).toString())}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
