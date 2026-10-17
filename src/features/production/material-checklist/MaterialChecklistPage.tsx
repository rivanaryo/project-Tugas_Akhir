import { AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';

interface MaterialCheck {
  id: string;
  workOrder: string;
  product: string;
  material: string;
  required: number;
  purchased: number;
  unit: string;
  status: 'sufficient' | 'shortage' | 'pending';
}

const materialChecks: MaterialCheck[] = [
  { id: '1', workOrder: 'SPK-001', product: 'Hoodie Fleece Custom', material: 'Fleece Cotton 330 GSM', required: 280, purchased: 300, unit: 'Meter', status: 'sufficient' },
  { id: '2', workOrder: 'SPK-001', product: 'Hoodie Fleece Custom', material: 'YKK Zipper #5', required: 100, purchased: 100, unit: 'Pcs', status: 'sufficient' },
  { id: '3', workOrder: 'SPK-002', product: 'Polo Shirt Cotton Pique', material: 'Cotton Pique 220 GSM', required: 360, purchased: 280, unit: 'Meter', status: 'shortage' },
  { id: '4', workOrder: 'SPK-002', product: 'Polo Shirt Cotton Pique', material: 'Button Polo', required: 600, purchased: 600, unit: 'Pcs', status: 'sufficient' },
  { id: '5', workOrder: 'SPK-003', product: 'Crewneck Sweatshirt', material: 'Fleece Cotton 330 GSM', required: 420, purchased: 150, unit: 'Meter', status: 'shortage' },
  { id: '6', workOrder: 'SPK-004', product: 'Jaket Bomber Varsity', material: 'Taslan Waterproof', required: 100, purchased: 100, unit: 'Meter', status: 'sufficient' },
  { id: '7', workOrder: 'SPK-005', product: 'T-Shirt Cotton Combed', material: 'Cotton Combed 30s', required: 600, purchased: 600, unit: 'Meter', status: 'sufficient' },
];

const statusConfig = {
  sufficient: { label: 'Cukup', variant: 'success' as const, icon: CheckCircle2 },
  shortage: { label: 'Kurang', variant: 'danger' as const, icon: AlertCircle },
  pending: { label: 'Pending', variant: 'warning' as const, icon: Package },
};

export function MaterialChecklistPage() {
  const shortageCount = materialChecks.filter((m) => m.status === 'shortage').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Material Checklist</CardTitle>
              <CardDescription>
                Perhitungan kebutuhan kain vs stok yang dibeli untuk setiap Work Order.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Production</Badge>
              {shortageCount > 0 && (
                <Badge variant="danger">{shortageCount} Shortage</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {materialChecks.map((check) => {
          const StatusIcon = statusConfig[check.status].icon;
          const percentage = Math.min((check.purchased / check.required) * 100, 100);
          const shortage = check.required - check.purchased;

          return (
            <Card key={check.id} className={check.status === 'shortage' ? 'border-rose-500/30' : ''}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-accent">{check.workOrder}</span>
                      <Badge variant={statusConfig[check.status].variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[check.status].label}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-text-h">{check.product}</p>
                      <p className="text-sm text-text">{check.material}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center lg:w-80">
                    <div>
                      <p className="text-xs text-text">Dibutuhkan</p>
                      <p className="text-sm font-semibold text-text-h">{check.required} {check.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text">Sudah Dibeli</p>
                      <p className="text-sm font-semibold text-text-h">{check.purchased} {check.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text">Sisa</p>
                      <p className={`text-sm font-semibold ${shortage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {shortage > 0 ? `-${shortage}` : `+${check.purchased - check.required}`} {check.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:w-64">
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                      <p className="mt-1 text-xs text-text">{percentage.toFixed(0)}% tercukupi</p>
                    </div>
                    {check.status === 'shortage' && (
                      <Button size="sm" variant="default" className="shrink-0">
                        Order PO
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
