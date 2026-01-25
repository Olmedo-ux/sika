import { BottomNav } from '@/components/layout/BottomNav';
import { WalletCard } from '@/components/shared/WalletCard';
import { BadgeChip } from '@/components/shared/BadgeChip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { collectionsApi, reviewsApi } from '@/services/api';
import type { Collection, Review } from '@/types';
import { Plus, Package, Clock, CheckCircle, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(user?.wallet || 0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch collections and reviews for this citizen
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [collectionsRes, reviewsRes] = await Promise.all([
          collectionsApi.getCitizenCollections(),
          reviewsApi.getReceived()
        ]);
        // L'API retourne {data: {data: Array}} - accéder au bon niveau
        const collectionsData = Array.isArray((collectionsRes.data as any)?.data) 
          ? (collectionsRes.data as any).data 
          : (Array.isArray(collectionsRes.data) ? collectionsRes.data : []);
        const reviewsData = Array.isArray((reviewsRes.data as any)?.data)
          ? (reviewsRes.data as any).data
          : (Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        setCollections(collectionsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Rafraîchir les données quand la page devient visible (après retour de NewCollection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        const fetchData = async () => {
          try {
            const collectionsRes = await collectionsApi.getCitizenCollections();
            const collectionsData = Array.isArray((collectionsRes.data as any)?.data) 
              ? (collectionsRes.data as any).data 
              : (Array.isArray(collectionsRes.data) ? collectionsRes.data : []);
            setCollections(collectionsData);
          } catch (error) {
            console.error('Error refreshing collections:', error);
          }
        };
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'pending': return <Clock className="h-4 w-4 text-secondary" />;
      default: return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      in_progress: 'En cours',
      completed: 'Terminée',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        {/* Welcome */}
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-6 w-6 sm:h-8 sm:w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Bonjour {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Prêt à recycler aujourd'hui ?</p>
          </div>
        </div>

        {/* Wallet */}
        <WalletCard balance={wallet} onWithdraw={(amount) => setWallet(w => w - amount)} />

        {/* Action Button - Only collection for citizens (no marketplace access) */}
        <Button className="w-full rounded-xl bg-primary h-12 sm:h-14 text-sm sm:text-lg" onClick={() => navigate('/dashboard/citizen/new-collection')}>
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 shrink-0" /> 
          <span className="truncate">Demander une collecte</span>
        </Button>

        {/* Pending Collections */}
        <Card className="rounded-xl border-secondary/50 bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              Demandes en attente d'acceptation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Chargement...</p>
            ) : collections.filter(col => col.status === 'pending').length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Aucune demande en attente</p>
                <p className="text-muted-foreground text-xs mt-1">Vos nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              collections.filter(col => col.status === 'pending').map((col) => (
                <div key={col.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-secondary/20">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="font-medium">{col.wasteType} • {col.quantity}</p>
                      <p className="text-sm text-muted-foreground">En attente de traitement</p>
                    </div>
                  </div>
                  <span className="text-xs text-secondary font-medium">En attente</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Collections */}
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mes collectes récentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl"
              onClick={() => navigate('/dashboard/citizen/history')}
            >
              Voir tout
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Chargement...</p>
            ) : collections.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune collecte pour le moment</p>
            ) : (
              collections.slice(0, 3).map((col) => (
                <div key={col.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(col.status)}
                    <div>
                      <p className="font-medium">{col.wasteType} • {col.quantity}</p>
                      <p className="text-sm text-muted-foreground">{getStatusLabel(col.status)}</p>
                    </div>
                  </div>
                  {col.amount && <span className="font-semibold text-primary">{col.amount} FCFA</span>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Reviews */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Mes avis reçus</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Chargement...</p>
            ) : reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun avis pour le moment</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {reviews.flatMap(r => r.badges).map((badge, i) => (
                  <BadgeChip key={i} label={badge} variant="primary" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
