import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { neighborhoods } from '@/lib/mock-data';
import { User, Truck, Factory, ArrowLeft, Phone, Lock, Building2, UserCircle, Upload, X, Image as ImageIcon, Eye, EyeOff, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import sikaGreenLogo from '@/assets/sikagreen-logo.png';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  const [phone, setPhone] = useState('+228 ');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [role, setRole] = useState<'citizen' | 'collector' | 'recycler'>('citizen');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { login, register, updateProfile, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirection automatique basée sur le rôle de l'utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'citizen') {
        navigate('/dashboard/citizen');
      } else if (user.role === 'collector') {
        navigate('/dashboard/collector');
      } else if (user.role === 'recycler') {
        navigate('/dashboard/recycler');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const roles = [
    { id: 'citizen', label: 'Citoyen', icon: <User className="h-6 w-6" />, desc: 'Je recycle mes déchets' },
    { id: 'collector', label: 'Collecteur', icon: <Truck className="h-6 w-6" />, desc: 'Entreprise de collecte' },
    { id: 'recycler', label: 'Recycleur', icon: <Factory className="h-6 w-6" />, desc: 'Entreprise de recyclage' },
  ];

  const isBusiness = role === 'collector' || role === 'recycler';

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner une image', variant: 'destructive' });
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Erreur', description: 'L\'image ne doit pas dépasser 2 Mo', variant: 'destructive' });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: 'Géolocalisation non disponible', 
        description: 'Votre navigateur ne supporte pas la géolocalisation', 
        variant: 'destructive' 
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast({ 
          title: 'Position obtenue', 
          description: 'Votre position a été enregistrée avec succès' 
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({ 
          title: 'Erreur de géolocalisation', 
          description: 'Impossible d\'obtenir votre position. Vérifiez les autorisations.', 
          variant: 'destructive' 
        });
        setGettingLocation(false);
      }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast({ 
        title: 'CGU non acceptées', 
        description: 'Vous devez accepter les conditions générales d\'utilisation', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    
    const success = await login(phone, password);
    
    if (success) {
      toast({ title: 'Connexion réussie', description: 'Bienvenue sur SikaGreen !' });
      // Navigation will be handled by useEffect after user state is updated
    } else {
      toast({ title: 'Erreur', description: 'Numéro ou mot de passe incorrect', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast({ 
        title: 'CGU non acceptées', 
        description: 'Vous devez accepter les conditions générales d\'utilisation', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (password !== passwordConfirmation) {
      toast({ 
        title: 'Erreur', 
        description: 'Les mots de passe ne correspondent pas', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (password.length < 6) {
      toast({ 
        title: 'Mot de passe trop court', 
        description: 'Le mot de passe doit contenir au moins 6 caractères', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await register({ 
        phone, 
        password, 
        name: isBusiness ? companyName : name, 
        neighborhood, 
        role,
        companyName: isBusiness ? companyName : undefined,
        responsibleName: isBusiness ? responsibleName : undefined,
      });
      
      if (success) {
        // Upload logo if one was selected
        if (logoFile) {
          const formData = new FormData();
          formData.append('image', logoFile);
          
          try {
            const uploadResponse = await fetch('http://localhost:8000/api/upload/image', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: formData,
            });
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              
              // Update profile directly via API instead of context method
              try {
                const profileResponse = await fetch('http://localhost:8000/api/profile', {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ avatar: uploadData.url }),
                });
                
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  
                  // Refetch user data to get updated avatar
                  try {
                    const userResponse = await fetch('http://localhost:8000/api/user', {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                      },
                    });
                    
                    if (userResponse.ok) {
                      const userData = await userResponse.json();
                      // Force update user state with fresh data
                      await updateProfile({ avatar: userData.avatar });
                    }
                  } catch (userError) {
                    console.error('Error fetching updated user:', userError);
                  }
                } else {
                  console.error('Failed to update profile with avatar');
                }
              } catch (profileError) {
                console.error('Error updating profile:', profileError);
              }
            }
          } catch (error) {
            console.error('Error uploading logo:', error);
          }
        }
        
        toast({ title: 'Inscription réussie', description: 'Bienvenue sur SikaGreen !' });
        
        // Small delay to ensure user state is updated before navigation
        setTimeout(() => {
          navigate(`/dashboard/${role}`);
        }, 200);
      } else {
        toast({ 
          title: 'Erreur d\'inscription', 
          description: 'Impossible de créer votre compte. Vérifiez vos informations.', 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Erreur', 
        description: error.message || 'Une erreur est survenue lors de l\'inscription', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Simple Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-5xl mx-auto flex h-14 items-center px-4">
          <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto py-6 sm:py-8 flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-xl shadow-lg">
          <CardHeader className="text-center pb-2">
            <img src={sikaGreenLogo} alt="SikaGreen" className="h-16 w-auto mx-auto mb-2" />
            <CardDescription>Économie circulaire au Togo</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="login" className="rounded-xl">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Numéro de téléphone
                    </Label>
                    <Input 
                      type="tel" 
                      placeholder="+228 90 12 34 56" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="rounded-xl" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="rounded-xl pr-10" 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms-login"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="terms-login" className="text-sm text-muted-foreground cursor-pointer">
                      J'accepte les{' '}
                      <Link to="/legal" className="text-primary hover:underline" target="_blank">
                        conditions générales d'utilisation
                      </Link>
                    </label>
                  </div>
                  <Button type="submit" className="w-full rounded-xl bg-primary" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Choisissez votre profil</Label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {roles.map((r) => (
                        <button key={r.id} type="button" onClick={() => setRole(r.id as typeof role)}
                          className={cn('p-2 sm:p-3 rounded-xl border text-center transition-all', role === r.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
                          <div className={cn('mx-auto mb-1', role === r.id ? 'text-primary' : 'text-muted-foreground')}>{r.icon}</div>
                          <p className="text-xs font-medium truncate">{r.label}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {roles.find(r => r.id === role)?.desc}
                    </p>
                  </div>

                  {/* Fields for Citizen */}
                  {!isBusiness && (
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-2" />
                        Nom complet
                      </Label>
                      <Input 
                        placeholder="Kofi Mensah" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="rounded-xl" 
                        required 
                      />
                    </div>
                  )}

                  {/* Fields for Businesses */}
                  {isBusiness && (
                    <>
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          Nom de l'entreprise
                        </Label>
                        <Input 
                          placeholder={role === 'collector' ? 'EcoCollect Togo' : 'Banafib Fabrik'} 
                          value={companyName} 
                          onChange={(e) => setCompanyName(e.target.value)} 
                          className="rounded-xl" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-2" />
                          Nom du responsable
                        </Label>
                        <Input 
                          placeholder="Yao Agbeko" 
                          value={responsibleName} 
                          onChange={(e) => setResponsibleName(e.target.value)} 
                          className="rounded-xl" 
                          required 
                        />
                      </div>

                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Logo de l'entreprise <span className="text-muted-foreground text-xs ml-1">(optionnel)</span>
                        </Label>
                        
                        {logoPreview ? (
                          <div className="relative w-24 h-24 mx-auto">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="w-24 h-24 object-contain rounded-xl border border-border bg-muted"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                          >
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Cliquez pour ajouter un logo</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG (max 2 Mo)</p>
                          </div>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Téléphone
                    </Label>
                    <Input 
                      type="tel" 
                      placeholder="+228 90 00 00 00" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="rounded-xl" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quartier / Zone</Label>
                    <Select value={neighborhood} onValueChange={setNeighborhood}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover">
                        {neighborhoods.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Localisation GPS <span className="text-muted-foreground text-xs ml-1">(optionnel)</span>
                      </span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="w-full rounded-xl justify-start"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      {gettingLocation ? 'Localisation en cours...' : locationCoords ? 'Position enregistrée ✓' : 'Obtenir ma position'}
                    </Button>
                    {locationCoords && (
                      <p className="text-xs text-muted-foreground">
                        Coordonnées: {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="rounded-xl pr-10" 
                        required 
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input 
                        type={showPasswordConfirmation ? "text" : "password"}
                        placeholder="••••••••" 
                        value={passwordConfirmation} 
                        onChange={(e) => setPasswordConfirmation(e.target.value)} 
                        className="rounded-xl pr-10" 
                        required 
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms-register"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="terms-register" className="text-sm text-muted-foreground cursor-pointer">
                      J'accepte les{' '}
                      <Link to="/legal" className="text-primary hover:underline" target="_blank">
                        conditions générales d'utilisation
                      </Link>
                    </label>
                  </div>
                  <Button type="submit" className="w-full rounded-xl bg-primary" disabled={loading}>
                    {loading ? 'Inscription...' : 'Créer mon compte'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
