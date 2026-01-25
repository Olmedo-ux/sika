import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  reviewCount,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const validRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(validRating);
          const partial = index === Math.floor(validRating) && validRating % 1 !== 0;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'transition-colors',
                interactive && 'cursor-pointer hover:scale-110'
              )}
              onClick={() => handleClick(index)}
              disabled={!interactive}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  filled || partial ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground ml-1">
          {validRating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-muted-foreground"> ({reviewCount} avis)</span>
          )}
        </span>
      )}
    </div>
  );
}
