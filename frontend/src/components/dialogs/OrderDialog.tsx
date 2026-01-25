import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { marketplaceOrdersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { MarketplaceProduct } from '@/types';
import { ShoppingCart, HandCoins, Loader2 } from 'lucide-react';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: MarketplaceProduct;
}

export function OrderDialog({ open, onOpenChange, product }: OrderDialogProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isBuying = product.productType === 'finished_product';
  const actionText = isBuying ? 'Acheter' : 'Vendre';
  const Icon = isBuying ? ShoppingCart : HandCoins;

  const totalAmount = parseInt(quantity || '0') * (product.pricePerUnit || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: 'Quantité invalide',
        description: 'Veuillez entrer une quantité valide',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      await marketplaceOrdersApi.createOrder({
        product_id: product.id,
        quantity: parseInt(quantity),
        message: message.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      toast({
        title: isBuying ? 'Demande d\'achat envoyée !' : 'Proposition de vente envoyée !',
        description: `${product.sellerName} recevra votre demande et vous contactera.`
      });

      onOpenChange(false);
      setQuantity('1');
      setMessage('');
      setPhone('');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {actionText} - {product.name}
          </DialogTitle>
          <DialogDescription>
            {isBuying 
              ? `Achetez ce produit auprès de ${product.sellerName}`
              : `Proposez de vendre cette matière à ${product.sellerName}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité ({product.unit})</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Prix unitaire</Label>
            <div className="text-lg font-bold text-primary">
              {product.pricePerUnit?.toLocaleString('fr-FR')} FCFA / {product.unit}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total estimé</Label>
            <div className="text-2xl font-bold text-primary">
              {totalAmount.toLocaleString('fr-FR')} FCFA
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +228 90 00 00 00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isBuying 
                ? "Précisez vos besoins, lieu de livraison, etc."
                : "Décrivez votre matière, disponibilité, etc."
              }
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 mr-2" />
                  {actionText}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
