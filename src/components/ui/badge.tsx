import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-accent/30 bg-accent-bg text-accent',
      success: 'border-emerald-300 bg-emerald-50 text-emerald-700',
      warning: 'border-amber-300 bg-amber-50 text-amber-700',
      danger: 'border-red-300 bg-red-50 text-red-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
