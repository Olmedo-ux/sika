import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { neighborhoods } from '@/lib/mock-data';
import { Camera, Upload, X, User, Building2, Phone, MapPin, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    neighborhood: user?.neighborhood || '',
    companyName: user?.companyName || '',
    responsibleName: user?.responsibleName || '',
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusiness = user?.role === 'collector' || user?.role === 'recycler';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 2 Mo",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format non supporté",
          description: "Veuillez choisir une image (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, we would upload the file to storage first
      // For now, we'll just update the profile with the data we have
      const success = await updateProfile({
        ...formData,
        avatar: avatarPreview || undefined,
      });
      
      if (success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès",
        });
        onOpenChange(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="edit-profile-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifier mon profil</DialogTitle>
          <p id="edit-profile-description" className="sr-only">Formulaire de modification des informations de profil</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary/30 transition-all duration-300 group-hover:border-primary/50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary/60" />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
              >
                <Camera className="h-4 w-4" />
              </button>
              
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute top-0 right-0 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl gap-2"
            >
              <Upload className="h-4 w-4" />
              {avatarPreview ? 'Changer la photo' : 'Ajouter une photo'}
            </Button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name field - different label for businesses */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                {isBusiness ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                {isBusiness ? 'Nom de l\'entreprise' : 'Nom complet'}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={isBusiness ? "Nom de votre entreprise" : "Votre nom"}
                className="rounded-xl"
                required
              />
            </div>

            {/* Responsible name for businesses */}
            {isBusiness && (
              <div className="space-y-2">
                <Label htmlFor="responsibleName" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Nom du responsable
                </Label>
                <Input
                  id="responsibleName"
                  value={formData.responsibleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                  placeholder="Nom du responsable"
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+228 90 00 00 00"
                className="rounded-xl"
                required
              />
            </div>

            {/* Neighborhood */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Quartier / Zone
              </Label>
              <Select
                value={formData.neighborhood}
                onValueChange={(value) => setFormData(prev => ({ ...prev, neighborhood: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sélectionner un quartier" />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
