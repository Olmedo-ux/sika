import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/shared/RatingStars';
import { BadgeChip } from '@/components/shared/BadgeChip';
import { collectorBadges, citizenBadges } from '@/lib/mock-data';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  targetRole: 'citizen' | 'collector';
  onSubmit: (data: { rating: number; badges: string[]; comment: string }) => void;
}

export function RatingDialog({
  open,
  onOpenChange,
  targetName,
  targetRole,
  onSubmit,
}: RatingDialogProps) {
  const [rating, setRating] = useState(5);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const badges = targetRole === 'collector' ? collectorBadges : citizenBadges;

  const toggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const handleSubmit = () => {
    onSubmit({ rating, badges: selectedBadges, comment });
    // Reset form
    setRating(5);
    setSelectedBadges([]);
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md" aria-describedby="rating-description">
        <DialogHeader>
          <DialogTitle>Évaluer {targetName}</DialogTitle>
          <p id="rating-description" className="sr-only">Formulaire d'évaluation de la collecte de déchets</p>
          <DialogDescription>
            Partagez votre expérience avec {targetRole === 'collector' ? 'ce collecteur' : 'ce citoyen'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-2">
            <RatingStars
              rating={rating}
              size="lg"
              interactive
              onRatingChange={setRating}
            />
            <p className="text-sm text-muted-foreground">
              {rating === 5 && 'Excellent !'}
              {rating === 4 && 'Très bien'}
              {rating === 3 && 'Bien'}
              {rating === 2 && 'Passable'}
              {rating === 1 && 'Décevant'}
            </p>
          </div>

          {/* Badge Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Badges rapides</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <BadgeChip
                  key={badge}
                  label={badge}
                  variant="outline"
                  selected={selectedBadges.includes(badge)}
                  onClick={() => toggleBadge(badge)}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Commentaire (optionnel)</p>
            <Textarea
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="rounded-xl bg-primary">
            Envoyer l'avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
