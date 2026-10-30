import * as React from 'react';
import { cn } from '../../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-text-h outline-none transition-all placeholder:text-text/70 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50',
        type === 'date' && 'date-input min-w-0 max-w-full font-medium tabular-nums hover:border-accent/50 disabled:hover:border-border aria-invalid:border-rose-500 aria-invalid:focus:ring-rose-500/20',
        className
      )}
      {...props}
    />
  );
}
