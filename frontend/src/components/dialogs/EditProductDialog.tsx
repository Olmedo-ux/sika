import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MarketplaceProduct } from '@/types';
import { Package, Recycle, Edit } from 'lucide-react';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { useAuth } from '@/contexts/AuthContext';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: MarketplaceProduct | null;
  onSubmit: (product: MarketplaceProduct) => void;
}

export function EditProductDialog({ open, onOpenChange, product, onSubmit }: EditProductDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<'raw_material' | 'finished_product'>('raw_material');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setProductType(product.productType);
      setQuantity(product.quantity.toString());
      setUnit(product.unit);
      setPricePerUnit(product.pricePerUnit.toString());
      setImages(product.imageUrls || (product.imageUrl ? [product.imageUrl] : []));
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setLoading(true);

    const updatedProduct: MarketplaceProduct = {
      ...product,
      name,
      description,
      productType,
      quantity: parseInt(quantity),
      unit,
      pricePerUnit: parseInt(pricePerUnit),
      imageUrl: images[0] || undefined,
      imageUrls: images.length > 0 ? images : undefined,
      updatedAt: new Date(),
    };

    onSubmit(updatedProduct);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="edit-product-description">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2 text-primary" />
            Modifier le produit
          </DialogTitle>
          <p id="edit-product-description" className="sr-only">Formulaire de modification d'un produit existant</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Type */}
          <div className="space-y-2">
            <Label>Type d'annonce</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProductType('raw_material')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  productType === 'raw_material' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <Recycle className={`h-6 w-6 mx-auto mb-1 ${productType === 'raw_material' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-xs font-medium">Demande d'achat</p>
                <p className="text-xs text-muted-foreground">Matières premières</p>
              </button>
              <button
                type="button"
                onClick={() => setProductType('finished_product')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  productType === 'finished_product' ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'
                }`}
              >
                <Package className={`h-6 w-6 mx-auto mb-1 ${productType === 'finished_product' ? 'text-secondary' : 'text-muted-foreground'}`} />
                <p className="text-xs font-medium">Offre de vente</p>
                <p className="text-xs text-muted-foreground">Produits finis</p>
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nom du produit</Label>
            <Input
              placeholder="Ex: Plastique PET trié, Pavés écologiques..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Décrivez votre produit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              required
            />
          </div>

          {/* Image Uploader */}
          <div className="space-y-2">
            <Label>Photos du produit</Label>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              userId={user?.id}
            />
            <p className="text-xs text-muted-foreground">
              Ajoutez jusqu'à 5 photos de votre produit
            </p>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantité disponible</Label>
              <Input
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-xl"
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Unité</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-popover">
                  <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                  <SelectItem value="pièces">Pièces</SelectItem>
                  <SelectItem value="tonnes">Tonnes</SelectItem>
                  <SelectItem value="m²">Mètres carrés (m²)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label>
              {productType === 'raw_material' 
                ? `Prix d'achat par ${unit}` 
                : `Prix de vente par ${unit}`}
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="500"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="rounded-xl pr-16"
                required
                min="1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                FCFA
              </span>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full rounded-xl bg-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
