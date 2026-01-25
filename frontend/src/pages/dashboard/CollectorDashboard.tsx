import { BottomNav } from '@/components/layout/BottomNav';
import { RatingStars } from '@/components/shared/RatingStars';
import { BadgeChip } from '@/components/shared/BadgeChip';
import { RatingDialog } from '@/components/dialogs/RatingDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { collectionsApi, reviewsApi, statsApi, chatApi } from '@/services/api';
import type { Collection } from '@/types';
import { MapPin, Check, MessageSquare, ShoppingCart, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function CollectorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ratingOpen, setRatingOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Collection | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Collection[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completedThisMonth: 0, totalWeight: 0 });

  // Fetch collections for this collector
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, statsRes] = await Promise.all([
          collectionsApi.getCollectorCollections(),
          statsApi.getDashboard()
        ]);
        // L'API retourne {data: {data: Array}} - accéder au bon niveau
        const collectionsData = Array.isArray((collectionsRes.data as any)?.data) 
          ? (collectionsRes.data as any).data 
          : (Array.isArray(collectionsRes.data) ? collectionsRes.data : []);
        
        const pending = collectionsData.filter(c => c.status === 'pending');
        const accepted = collectionsData.filter(c => c.status === 'accepted' || c.status === 'in_progress');
        
        setPendingRequests(pending);
        setAcceptedTasks(accepted);
        setStats({
          completedThisMonth: statsRes.data.completedThisMonth || 0,
          totalWeight: statsRes.data.totalWeight || 0
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

  const handleChat = async (task: Collection) => {
    try {
      const response = await chatApi.createConversation(task.citizenId);
      navigate(`/chat?conversation=${response.data.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir le chat',
        variant: 'destructive'
      });
    }
  };

  const handleAccept = async (task: Collection) => {
    try {
      const response = await collectionsApi.accept(task.id);
      const updatedCollection = response.data;
      setPendingRequests(prev => prev.filter(t => t.id !== task.id));
      setAcceptedTasks(prev => [...prev, updatedCollection]);
      toast({ title: 'Demande acceptée', description: 'Vous pouvez maintenant démarrer la collecte' });
    } catch (error) {
      console.error('Error accepting collection:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'accepter la demande', variant: 'destructive' });
    }
  };

  const handleReject = async (task: Collection) => {
    try {
      await collectionsApi.reject(task.id);
      setPendingRequests(prev => prev.filter(t => t.id !== task.id));
      toast({ title: 'Demande refusée', description: 'La demande a été annulée' });
    } catch (error) {
      console.error('Error rejecting collection:', error);
      toast({ title: 'Erreur', description: 'Impossible de refuser la demande', variant: 'destructive' });
    }
  };

  const handleStart = async (task: Collection) => {
    try {
      const response = await collectionsApi.start(task.id);
      const updatedCollection = response.data;
      setAcceptedTasks(prev => prev.map(t => t.id === task.id ? updatedCollection : t));
      toast({ title: 'Collecte démarrée', description: 'Vous pouvez suivre la localisation du client' });
      navigate('/dashboard/collector/map');
    } catch (error) {
      console.error('Error starting collection:', error);
      toast({ title: 'Erreur', description: 'Impossible de démarrer la collecte', variant: 'destructive' });
    }
  };

  const handleComplete = (task: Collection) => {
    setCurrentTask(task);
    setRatingOpen(true);
  };

  const handleRatingSubmit = async (data: { rating: number; badges: string[]; comment: string }) => {
    try {
      // Update collection status to completed
      await collectionsApi.update(currentTask!.id, { status: 'completed' });
      
      // Submit review
      await reviewsApi.create({
        to_user_id: currentTask!.citizenId,
        rating: data.rating,
        badges: data.badges,
        comment: data.comment
      });

      setAcceptedTasks(prev => prev.filter(t => t.id !== currentTask?.id));
      toast({ title: 'Collecte terminée !', description: `Vous avez donné ${data.rating} étoiles à ${currentTask?.citizenName}` });
    } catch (error) {
      console.error('Error completing collection:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer la collecte',
        variant: 'destructive'
      });
    }
  };


  const companyName = user?.companyName || user?.name || 'Entreprise';
  const responsibleName = user?.responsibleName || user?.name || 'Responsable';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        {/* Welcome + Company Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl shrink-0">
              <AvatarImage src={user?.avatar} alt={companyName} />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">{companyName}</h1>
              <p className="text-muted-foreground text-sm truncate">Responsable: {responsibleName}</p>
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <RatingStars rating={user?.rating || 0} showValue reviewCount={user?.reviewCount || 0} />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {user?.badges?.map((badge) => (
            <BadgeChip key={badge} label={badge} variant="primary" />
          ))}
          {(user?.rating || 0) >= 4.5 && <BadgeChip label="🏆 Top Collecteur" variant="secondary" />}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="rounded-xl">
            <CardContent className="pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{pendingRequests.length}</p>
              <p className="text-xs text-muted-foreground">Demandes</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-secondary">{stats.completedThisMonth}</p>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="pt-3 pb-3 sm:pt-4 sm:pb-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalWeight}kg</p>
              <p className="text-xs text-muted-foreground">Collectés</p>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Button */}
        <Button 
          variant="outline" 
          className="w-full rounded-xl h-12"
          onClick={() => navigate('/marketplace')}
        >
          <ShoppingCart className="h-5 w-5 mr-2" /> Voir la marketplace
        </Button>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-secondary" />
                Nouvelles demandes ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((task) => (
                <div key={task.id} className="p-4 bg-secondary/10 rounded-xl space-y-3 border border-secondary/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{task.citizenName}</p>
                      <p className="text-sm text-muted-foreground">{task.wasteType} • {task.quantity}</p>
                      <p className="text-sm mt-1 text-muted-foreground">Gain: {task.amount?.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <BadgeChip label="Nouveau" variant="secondary" size="sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl flex-1"
                      onClick={() => handleReject(task)}
                    >
                      Refuser
                    </Button>
                    <Button size="sm" className="rounded-xl flex-1 bg-primary" onClick={() => handleAccept(task)}>
                      <Check className="h-4 w-4 mr-1" /> Accepter
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Accepted Tasks */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Mes collectes ({acceptedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Chargement...</p>
            ) : acceptedTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune collecte acceptée</p>
            ) : (
              acceptedTasks.map((task) => (
                <div key={task.id} className="p-4 bg-muted/50 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{task.citizenName}</p>
                      <p className="text-sm text-muted-foreground">{task.location.address}</p>
                      <p className="text-sm mt-1">{task.wasteType} • {task.quantity}</p>
                    </div>
                    <BadgeChip label={task.status === 'in_progress' ? 'En cours' : 'Acceptée'} variant="primary" size="sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl flex-1"
                      onClick={() => handleChat(task)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" /> Chat
                    </Button>
                    {task.status === 'accepted' && (
                      <Button size="sm" className="rounded-xl flex-1 bg-secondary" onClick={() => handleStart(task)}>
                        <MapPin className="h-4 w-4 mr-1" /> Démarrer
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button size="sm" className="rounded-xl flex-1 bg-primary" onClick={() => handleComplete(task)}>
                        <Check className="h-4 w-4 mr-1" /> Terminer
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />

      {currentTask && (
        <RatingDialog
          open={ratingOpen}
          onOpenChange={setRatingOpen}
          targetName={currentTask.citizenName}
          targetRole="citizen"
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}
