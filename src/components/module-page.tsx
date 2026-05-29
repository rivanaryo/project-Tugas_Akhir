import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ModulePageProps {
  title: string;
  description: string;
  badge: string;
  children?: ReactNode;
}

export function ModulePage({ title, description, badge, children }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute right-6 top-6 hidden rounded-full bg-accent-bg px-3 py-1 text-xs font-semibold text-accent md:block">
            {badge}
          </div>
          <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            'Workflow automation ready',
            'Shared ERP navigation applied',
            'Prepared for API integration',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-border/70 bg-surface-2 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-h">
                <ArrowUpRight className="h-4 w-4 text-accent" />
                {item}
              </div>
              <p className="text-sm text-text">Module scaffolding is now aligned with the admin shell.</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {children}

      <div className="flex flex-wrap gap-2">
        <Badge>{badge}</Badge>
        <Badge variant="success">Responsive layout</Badge>
        <Badge variant="warning">Ready for next feature slice</Badge>
      </div>
    </div>
  );
}
