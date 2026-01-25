import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, LogOut, User, Store, Home, ChevronRight, LayoutDashboard, MessageSquare } from 'lucide-react';
import sikaGreenLogo from '@/assets/sikagreen-logo.png';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'citizen':
        return '/dashboard/citizen';
      case 'collector':
        return '/dashboard/collector';
      case 'recycler':
        return '/dashboard/recycler';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-300">
          <img src={sikaGreenLogo} alt="SikaGreen" className="h-10 sm:h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300 flex items-center gap-1.5 group">
            <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Accueil
          </Link>
          <Link to="/marketplace" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300 flex items-center gap-1.5 group">
            <Store className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Marketplace
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl h-9 w-9 hover:rotate-180 transition-all duration-500">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl h-9 px-3 gap-2 border-primary/20 hover:border-primary/40">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-background border border-border shadow-lg">
                <div className="px-2 py-1.5 mb-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="cursor-pointer rounded-lg gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/chat')} className="cursor-pointer rounded-lg gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer rounded-lg gap-2">
                  <User className="h-4 w-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive rounded-lg gap-2">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="rounded-xl text-sm">
                Connexion
              </Button>
              <Button onClick={() => navigate('/auth?tab=register')} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                S'inscrire
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl h-9 w-9"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <VisuallyHidden>
                <SheetTitle>Menu de navigation</SheetTitle>
              </VisuallyHidden>
              
              {/* Header du tiroir */}
              <div className="p-6 border-b border-border">
                <img src={sikaGreenLogo} alt="SikaGreen" className="h-10 w-auto" />
              </div>

              {/* Navigation */}
              <nav className="flex flex-col p-4 space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Accueil
                </Link>
                <Link
                  to="/marketplace"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Store className="h-5 w-5" />
                  Marketplace
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Tableau de bord
                    </Link>
                    <Link
                      to="/chat"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageSquare className="h-5 w-5" />
                      Messages
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Mon profil
                    </Link>
                  </>
                )}
              </nav>

              {/* Actions en bas */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-xl justify-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-xl w-full justify-center"
                    >
                      Connexion
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/auth?tab=register');
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-xl w-full bg-primary justify-center shadow-lg shadow-primary/25"
                    >
                      S'inscrire
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
