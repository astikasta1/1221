import { clsx } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-tertiary text-text-secondary border border-border',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  accent: 'bg-accent/20 text-accent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
