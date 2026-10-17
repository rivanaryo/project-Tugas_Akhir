import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-accent/30 bg-accent-bg text-accent',
      secondary: 'border-slate-600 bg-slate-900/60 text-slate-300',
      info: 'border-blue-500/30 bg-blue-500/100/10 text-blue-400',
      success: 'border-emerald-500/30 bg-emerald-500/100/10 text-emerald-400',
      warning: 'border-amber-500/30 bg-amber-500/100/10 text-amber-400',
      danger: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
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
