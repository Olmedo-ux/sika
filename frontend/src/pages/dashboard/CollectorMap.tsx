import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collectionsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Collection } from '@/types';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export default function CollectorMap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCollections, setActiveCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await collectionsApi.getCollectorCollections();
        const collectionsData = Array.isArray((response.data as any)?.data) 
          ? (response.data as any).data 
          : (Array.isArray(response.data) ? response.data : []);
        // Show only accepted and in-progress collections
        setActiveCollections(collectionsData.filter(c => c.status === 'accepted' || c.status === 'in_progress'));
      } catch (error) {
        console.error('Error fetching collections:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les collectes',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollections();
    }
  }, [user, toast]);

  const openGoogleMaps = (collection: Collection) => {
    const destination = `${collection.location.lat},${collection.location.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <Navigation className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
            Navigation
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Collectes actives avec navigation GPS
          </p>
        </div>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">
              Collectes en cours ({activeCollections.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Chargement...</p>
            ) : activeCollections.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune collecte active</p>
                <p className="text-sm text-muted-foreground mt-2">Acceptez une demande pour commencer</p>
              </div>
            ) : (
              activeCollections.map((collection) => (
                <Card key={collection.id} className="rounded-xl bg-primary/5 border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{collection.citizenName}</p>
                        <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{collection.location.address}</span>
                        </div>
                      </div>
                      <Badge variant={collection.status === 'in_progress' ? 'default' : 'secondary'}>
                        {collection.status === 'in_progress' ? 'En cours' : 'Acceptée'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Type</p>
                        <p className="font-medium">{collection.wasteType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Quantité</p>
                        <p className="font-medium">{collection.quantity}</p>
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-xl bg-primary h-12"
                      onClick={() => openGoogleMaps(collection)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Ouvrir dans Google Maps
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
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
