import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { configApi } from '@/services/api';
import type { CollectionPoint } from '@/types';
import { Factory, MapPin, Phone, MessageSquare, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function CitizenRecyclersMap() {
  const navigate = useNavigate();
  const [selectedRecycler, setSelectedRecycler] = useState<string | null>(null);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch collection points (recyclers and collectors)
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await configApi.getCollectionPoints();
        setCollectionPoints(response.data);
      } catch (error) {
        console.error('Error fetching collection points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);
  
  // Get recycler points from collection points
  const recyclerPoints = collectionPoints.filter(p => p.type === 'recycler');

  const handlePointClick = (point: typeof collectionPoints[0]) => {
    if (point.type === 'recycler') {
      setSelectedRecycler(point.id);
    }
  };

  const handleContact = (recyclerId: string) => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <Factory className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary shrink-0" />
            Recycleurs à proximité
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Découvrez les entreprises de recyclage et leurs zones d'activité
          </p>
        </div>

        {/* Interactive Map */}
        <Card className="rounded-xl overflow-hidden">
          <InteractiveMap 
            height="300px" 
            points={collectionPoints}
            onPointClick={handlePointClick}
            selectedPoint={selectedRecycler}
          />
        </Card>

        {/* Legend */}
        <div className="flex gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Recycleurs</span>
          </div>
        </div>

        {/* Recyclers List */}
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Chargement...</p>
        ) : recyclerPoints.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucun recycleur disponible</p>
        ) : (
          <div className="space-y-4">
            {recyclerPoints.map((point) => {
              return (
                <Card 
                  key={point.id} 
                  className={`rounded-xl cursor-pointer transition-all ${
                    selectedRecycler === point.id && "ring-2 ring-primary"
                  }`}
                  onClick={() => setSelectedRecycler(point.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Factory className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{point.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{point.neighborhood || 'Lomé'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContact(point.id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {selectedRecycler === point.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Lat: {point.lat}, Lng: {point.lng}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}

        {/* Info Card */}
        <Card className="rounded-xl bg-muted/50">
          <CardContent className="py-4">
            <h3 className="font-medium mb-2">À propos des recycleurs</h3>
            <p className="text-sm text-muted-foreground">
              Les entreprises de recyclage achètent des matières premières recyclables aux collecteurs 
              et les transforment en produits finis. Consultez leurs offres sur la marketplace.
            </p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
