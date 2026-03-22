import { clsx } from '../../lib/utils';

interface RatingProps {
  value: number;
  className?: string;
}

export function Rating({ value, className }: RatingProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1', className)}>
      <svg
        className="w-4 h-4 text-warning fill-current"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 1l2.39 6.09H19l-5.3 4.18L15.78 19 10 14.82 4.22 19l2.08-7.73L1 7.09h6.61L10 1z" />
      </svg>
      <span className="text-sm font-medium text-warning">
        {value.toFixed(1)}
      </span>
    </span>
  );
}
