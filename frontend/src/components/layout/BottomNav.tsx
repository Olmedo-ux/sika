import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Map, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    const baseItems: NavItem[] = [
      { path: `/dashboard/${user.role}`, icon: <Home className="h-5 w-5" />, label: 'Accueil' },
    ];

    if (user.role === 'citizen') {
      // Citizens can view marketplace (read-only) and see recyclers map
      return [
        ...baseItems,
        { path: '/marketplace', icon: <ShoppingCart className="h-5 w-5" />, label: 'Marché' },
        { path: '/dashboard/citizen/recyclers', icon: <Map className="h-5 w-5" />, label: 'Recycleurs' },
        { path: '/chat', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
        { path: '/profile', icon: <User className="h-5 w-5" />, label: 'Profil' },
      ];
    }

    if (user.role === 'collector') {
      return [
        ...baseItems,
        { path: '/dashboard/collector/map', icon: <Map className="h-5 w-5" />, label: 'Navigation' },
        { path: '/dashboard/collector/history', icon: <Package className="h-5 w-5" />, label: 'Historique' },
        { path: '/chat', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
        { path: '/profile', icon: <User className="h-5 w-5" />, label: 'Profil' },
      ];
    }

    if (user.role === 'recycler') {
      return [
        ...baseItems,
        { path: '/dashboard/recycler/marketplace', icon: <Package className="h-5 w-5" />, label: 'Produits' },
        { path: '/dashboard/recycler/orders', icon: <ShoppingCart className="h-5 w-5" />, label: 'Commandes' },
        { path: '/chat', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
        { path: '/profile', icon: <User className="h-5 w-5" />, label: 'Profil' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
