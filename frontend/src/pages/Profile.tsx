import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { RatingStars } from '@/components/shared/RatingStars';
import { BadgeChip } from '@/components/shared/BadgeChip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, LogOut, Star, Building2, UserCircle, Edit2, User } from 'lucide-react';
import { EditProfileDialog } from '@/components/dialogs/EditProfileDialog';
import { statsApi } from '@/services/api';

interface UserStats {
  // Citizen stats
  pendingCollections?: number;
  completedThisMonth?: number;
  totalWeight?: number;
  totalEarnings?: number;
  // Collector stats (uses same fields as citizen)
  // Recycler stats
  totalSales?: number;
  totalRevenue?: number;
  activeProducts?: number;
  totalProducts?: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stats, setStats] = useState<UserStats>({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await statsApi.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      citizen: 'Citoyen',
      collector: 'Entreprise de collecte',
      recycler: 'Entreprise de recyclage',
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      citizen: '👤',
      collector: '🚴',
      recycler: '🏭',
    };
    return icons[role] || '👤';
  };

  const isBusiness = user.role === 'collector' || user.role === 'recycler';
  const displayName = isBusiness ? user.companyName || user.name : user.name;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        {/* Profile Header */}
        <Card className="rounded-xl overflow-hidden">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 relative">
            {/* Edit Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
              className="absolute top-3 right-3 rounded-xl h-9 w-9 hover:bg-primary/10 transition-all duration-300"
            >
              <Edit2 className="h-4 w-4 text-primary" />
            </Button>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden border-4 border-primary/30 transition-all duration-300 hover:border-primary/50">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-4xl">{getRoleIcon(user.role)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{displayName}</h1>
                <p className="text-sm text-muted-foreground truncate">{getRoleLabel(user.role)}</p>
                {user.rating && (
                  <div className="mt-1 sm:mt-2">
                    <RatingStars rating={user.rating} showValue reviewCount={user.reviewCount} size="sm" />
                  </div>
                )}
              </div>
            </div>

            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {user.badges.map((badge) => (
                  <BadgeChip key={badge} label={badge} variant="primary" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />

        {/* Contact Info */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quartier / Zone</p>
                <p className="font-medium">{user.neighborhood}</p>
              </div>
            </div>
            {isBusiness && user.responsibleName && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsable</p>
                  <p className="font-medium">{user.responsibleName}</p>
                </div>
              </div>
            )}
            {isBusiness && user.companyName && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entreprise</p>
                  <p className="font-medium">{user.companyName}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats for Citizen */}
        {user.role === 'citizen' && user.wallet !== undefined && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-muted rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-primary">
                    {loadingStats ? '...' : (stats.totalEarnings || 0).toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">FCFA gagnés</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-secondary">
                    {loadingStats ? '...' : (stats.completedThisMonth || 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Collectes ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats for Collector */}
        {user.role === 'collector' && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {loadingStats ? '...' : (stats.completedThisMonth || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Collectes</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-secondary">
                    {loadingStats ? '...' : (stats.totalWeight || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-secondary fill-secondary mr-0.5 sm:mr-1" />
                    <span className="text-lg sm:text-2xl font-bold">{user.rating || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Note</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats for Recycler */}
        {user.role === 'recycler' && (
          <Card className="rounded-xl">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {loadingStats ? '...' : (stats.totalProducts || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Produits</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-secondary">
                    {loadingStats ? '...' : (stats.totalSales || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Ventes (kg)</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {loadingStats ? '...' : ((stats.totalRevenue || 0) / 1000).toFixed(1) + 'K'}
                  </p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Button variant="destructive" className="w-full rounded-xl justify-start" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
