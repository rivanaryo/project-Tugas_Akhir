import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type BreadcrumbProps = React.ComponentPropsWithoutRef<'nav'>;

function Breadcrumb({ ...props }: BreadcrumbProps) {
  return <nav aria-label="breadcrumb" {...props} />;
}

type BreadcrumbListProps = React.ComponentPropsWithoutRef<'ol'>;

function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-text',
        className
      )}
      {...props}
    />
  );
}

type BreadcrumbItemProps = React.ComponentPropsWithoutRef<'li'>;

function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  asChild?: boolean;
}

function BreadcrumbLink({ asChild = false, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return <Comp className={cn('transition-colors hover:text-text-h', className)} {...props} />;
}

type BreadcrumbPageProps = React.ComponentPropsWithoutRef<'span'>;

function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return <span className={cn('font-semibold text-text-h', className)} aria-current="page" {...props} />;
}

type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'li'>;

function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li aria-hidden="true" className={cn('text-text', className)} {...props}>
      {children ?? <ChevronRight className="h-3.5 w-3.5" />}
    </li>
  );
}

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};