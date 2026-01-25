import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RatingDialog } from '@/components/dialogs/RatingDialog';
import { collectionsApi, reviewsApi } from '@/services/api';
import type { Collection } from '@/types';
import { Package, Clock, CheckCircle, XCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function CitizenHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await collectionsApi.getCitizenCollections();
        // L'API retourne {data: {data: Array}} - accéder au bon niveau
        const collectionsData = Array.isArray((response.data as any)?.data) 
          ? (response.data as any).data 
          : (Array.isArray(response.data) ? response.data : []);
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollections();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'pending': return <Clock className="h-5 w-5 text-secondary" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-primary';
      case 'pending': return 'text-secondary';
      case 'cancelled': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  };

  const handleRateCollector = (collection: Collection) => {
    setCurrentCollection(collection);
    setRatingOpen(true);
  };

  const handleSubmitRating = async (data: { rating: number; badges: string[]; comment: string }) => {
    if (!currentCollection?.collectorId) return;

    try {
      await reviewsApi.create({
        to_user_id: currentCollection.collectorId,
        rating: data.rating,
        badges: data.badges,
        comment: data.comment,
      });

      toast({
        title: 'Avis envoyé',
        description: 'Merci pour votre évaluation !',
      });

      // Marquer la collecte comme notée localement
      setCollections(prev => prev.map(col => 
        col.id === currentCollection.id ? { ...col, hasRated: true } : col
      ));
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'avis',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-6 space-y-6 px-4">
        <h1 className="text-2xl font-bold">Historique des collectes</h1>
        
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Chargement...</p>
        ) : collections.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune collecte pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {collections.map((col) => (
              <Card key={col.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(col.status)}
                      <div>
                        <p className="font-semibold">{col.wasteType}</p>
                        <p className="text-sm text-muted-foreground">{col.quantity}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(col.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn('text-sm font-medium', getStatusColor(col.status))}>
                        {getStatusLabel(col.status)}
                      </span>
                      {col.amount && col.status === 'completed' && (
                        <p className="text-lg font-bold text-primary mt-1">+{col.amount} FCFA</p>
                      )}
                    </div>
                  </div>
                  {col.collectorName && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Collecteur : <span className="text-foreground">{col.collectorName}</span>
                        </p>
                        {col.status === 'completed' && !col.hasRated && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRateCollector(col)}
                            className="rounded-full gap-1.5"
                          >
                            <Star className="h-3.5 w-3.5" />
                            Noter
                          </Button>
                        )}
                        {col.hasRated && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            Noté
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />

      {currentCollection && (
        <RatingDialog
          open={ratingOpen}
          onOpenChange={setRatingOpen}
          targetName={currentCollection.collectorName || 'le collecteur'}
          targetRole="collector"
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}
