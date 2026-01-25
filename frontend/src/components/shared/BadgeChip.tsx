import { cn } from '@/lib/utils';

interface BadgeChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function BadgeChip({
  label,
  variant = 'default',
  size = 'md',
  selected = false,
  onClick,
  icon,
}: BadgeChipProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    default: selected
      ? 'bg-primary text-primary-foreground'
      : 'bg-muted text-muted-foreground hover:bg-muted/80',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    outline: selected
      ? 'border-2 border-primary bg-primary/10 text-primary'
      : 'border border-border text-muted-foreground hover:border-primary hover:text-primary',
  };

  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      disabled={!onClick}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  );
}
