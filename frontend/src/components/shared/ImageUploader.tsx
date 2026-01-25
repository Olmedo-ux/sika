import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  userId?: string;
}

export function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  userId 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Limite atteinte',
        description: `Maximum ${maxImages} images autorisées`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Format invalide',
          description: 'Seules les images sont acceptées',
          variant: 'destructive'
        });
        continue;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'Taille maximum: 2MB',
          variant: 'destructive'
        });
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && response.data.url) {
          newImages.push(response.data.url);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Erreur upload',
          description: 'Impossible de télécharger l\'image',
          variant: 'destructive'
        });
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <img 
                src={url} 
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl border-dashed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                Ajouter des photos ({images.length}/{maxImages})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
