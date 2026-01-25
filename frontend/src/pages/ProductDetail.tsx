import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { marketplaceApi } from '@/services/api';
import type { MarketplaceProduct } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Package, 
  Recycle, 
  MessageSquare, 
  ShoppingCart, 
  MapPin, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  Clock,
  CheckCircle,
  HandCoins
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine if user is a recycler
  const isRecycler = user?.role === 'recycler';

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await marketplaceApi.getProducts();
        const foundProduct = response.data.find(p => p.id === id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le produit',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  // Mock images for gallery (in real app, would come from product data)
  const productImages = [
    product?.imageUrl || null,
    null, // Placeholder for additional images
    null,
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Produit non trouvé</h1>
          <p className="text-muted-foreground mb-6">Ce produit n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/marketplace')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la marketplace
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({ 
        title: 'Connexion requise', 
        description: 'Veuillez vous connecter pour contacter le recycleur',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (!contactMessage.trim()) {
      toast({ 
        title: 'Message requis', 
        description: 'Veuillez écrire un message',
        variant: 'destructive'
      });
      return;
    }

    setSendingMessage(true);
    
    // Simulate sending message
    setTimeout(() => {
      setSendingMessage(false);
      setContactMessage('');
      toast({ 
        title: 'Message envoyé ! ✉️', 
        description: `${product.sellerName} recevra votre message.` 
      });
    }, 1000);
  };

  const handleAction = () => {
    if (!isAuthenticated) {
      toast({ 
        title: 'Connexion requise', 
        description: 'Veuillez vous connecter pour continuer',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (isRecycler) {
      toast({ 
        title: 'Action non autorisée', 
        description: 'Gérez vos produits depuis votre espace recycleur',
        variant: 'destructive'
      });
      navigate('/dashboard/recycler/marketplace');
      return;
    }

    if (product.productType === 'raw_material') {
      // Recycler is BUYING raw materials → User can SELL
      toast({ 
        title: 'Proposition envoyée ! 🎉', 
        description: `${product.sellerName} sera notifié que vous souhaitez lui vendre des "${product.name}"`
      });
    } else {
      // Recycler is SELLING finished products → User can BUY
      toast({ 
        title: 'Demande d\'achat envoyée ! 🎉', 
        description: `${product.sellerName} sera notifié de votre intérêt pour "${product.name}"`
      });
    }
  };

  // Get action button text based on product type
  const getActionButton = () => {
    if (product.productType === 'raw_material') {
      return { text: 'Vendre ma matière', icon: HandCoins };
    }
    return { text: 'Acheter', icon: ShoppingCart };
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % Math.max(productImages.length, 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + Math.max(productImages.length, 1)) % Math.max(productImages.length, 1));
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-20">
      <div className="container max-w-5xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-4">
        {/* Back link - mobile only */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground sm:hidden"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>

        {/* Image Gallery */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 aspect-[4/3] sm:aspect-video">
          {/* Main Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              product.productType === 'raw_material' ? (
                <Recycle className="h-20 w-20 sm:h-32 sm:w-32 text-primary/50" />
              ) : (
                <Package className="h-20 w-20 sm:h-32 sm:w-32 text-secondary/50" />
              )
            )}
          </div>

          {/* Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {productImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentImageIndex ? 'bg-primary' : 'bg-background/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badge */}
          <Badge 
            variant={product.productType === 'raw_material' ? 'default' : 'secondary'} 
            className="absolute top-3 right-3 rounded-xl"
          >
            {product.productType === 'raw_material' ? 'Demande d\'achat' : 'Offre de vente'}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {product.productType === 'raw_material' ? 'Acheteur: ' : 'Vendeur: '}
                {product.sellerName}
              </span>
            </div>
          </div>

          {/* Price & Availability */}
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {product.productType === 'raw_material' ? 'Prix d\'achat' : 'Prix de vente'}
                  </p>
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(product.pricePerUnit)} FCFA
                  </span>
                  <span className="text-muted-foreground">/{product.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {product.productType === 'raw_material' 
                      ? `Besoin: ${product.quantity} ${product.unit}` 
                      : `Stock: ${product.quantity} ${product.unit}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl h-12"
              onClick={() => {
                const contactSection = document.getElementById('contact-seller');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Contacter
            </Button>
            {(() => {
              const actionBtn = getActionButton();
              const ActionIcon = actionBtn.icon;
              return (
                <Button 
                  className={`rounded-xl h-12 ${
                    product.productType === 'raw_material' 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/90'
                  }`}
                  onClick={handleAction}
                >
                  <ActionIcon className="h-4 w-4 mr-2" /> {actionBtn.text}
                </Button>
              );
            })()}
          </div>

          {/* Description */}
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold flex items-center">
                <Package className="h-4 w-4 mr-2 text-primary" />
                Description
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
              
              {/* Additional Info */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Publié récemment</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Lomé, Togo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-primary" />
                {product.productType === 'raw_material' ? 'Acheteur (Recycleur)' : 'Vendeur (Recycleur)'}
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{product.sellerName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-secondary text-secondary" />
                    <span>4.8</span>
                    <span className="mx-1">•</span>
                    <span>Entreprise de recyclage</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="rounded-xl" id="contact-seller">
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                Contacter {product.productType === 'raw_material' ? 'l\'acheteur' : 'le vendeur'}
              </h2>
              
              <form onSubmit={handleContact} className="space-y-4">
                {!isAuthenticated && (
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-sm">Votre téléphone</Label>
                    <Input 
                      id="contact-phone"
                      type="tel"
                      placeholder="+228 90 00 00 00"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm">Votre message</Label>
                  <Textarea 
                    id="contact-message"
                    placeholder={`Bonjour, je suis intéressé(e) par "${product.name}"...`}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="rounded-xl resize-none min-h-[100px]"
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-xl bg-primary"
                  disabled={sendingMessage}
                >
                  {sendingMessage ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Envoyer le message
                    </>
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline">Connectez-vous</Link> pour un suivi de vos messages
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {isAuthenticated && <BottomNav />}
    </div>
  );
}
