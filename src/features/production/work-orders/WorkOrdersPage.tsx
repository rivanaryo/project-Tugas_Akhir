import { Calendar, Package, Plus, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

interface WorkOrder {
  id: string;
  number: string;
  salesOrder: string;
  product: string;
  quantity: number;
  stage: 'cutting' | 'printing' | 'sewing' | 'qc' | 'ready';
  status: 'draft' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  dueDate: string;
  progress: number;
}

const workOrders: WorkOrder[] = [
  { id: '1', number: 'SPK-2024-001', salesOrder: 'PO-001', product: 'Hoodie Fleece Custom', quantity: 100, stage: 'sewing', status: 'in-progress', startDate: '2024-01-10', dueDate: '2024-02-10', progress: 45 },
  { id: '2', number: 'SPK-2024-002', salesOrder: 'PO-002', product: 'Polo Shirt Cotton Pique', quantity: 200, stage: 'printing', status: 'in-progress', startDate: '2024-01-15', dueDate: '2024-02-15', progress: 25 },
  { id: '3', number: 'SPK-2024-003', salesOrder: 'PO-003', product: 'Crewneck Sweatshirt', quantity: 150, stage: 'cutting', status: 'in-progress', startDate: '2024-01-20', dueDate: '2024-02-20', progress: 10 },
  { id: '4', number: 'SPK-2024-004', salesOrder: 'PO-004', product: 'Jaket Bomber Varsity', quantity: 50, stage: 'qc', status: 'in-progress', startDate: '2024-01-05', dueDate: '2024-02-05', progress: 85 },
  { id: '5', number: 'SPK-2024-005', salesOrder: 'PO-005', product: 'T-Shirt Cotton Combed', quantity: 300, stage: 'ready', status: 'completed', startDate: '2024-01-02', dueDate: '2024-01-25', progress: 100 },
];

const stageConfig = {
  cutting: { label: 'Cutting', variant: 'info' as const },
  printing: { label: 'Printing/Bordir', variant: 'warning' as const },
  sewing: { label: 'Sewing', variant: 'warning' as const },
  qc: { label: 'QC & Packing', variant: 'info' as const },
  ready: { label: 'Ready', variant: 'success' as const },
};

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const },
  'in-progress': { label: 'In Progress', variant: 'warning' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'danger' as const },
};

export function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Work Orders / SPK</CardTitle>
              <CardDescription>
                Surat Perintah Kerja produksi untuk pesanan Make-to-Order.
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/production/work-orders/create">
                <Plus className="h-4 w-4" />
                Buat SPK
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workOrders.map((order) => (
          <Card key={order.id} className="hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{order.number}</CardTitle>
                    <CardDescription className="text-xs">{order.salesOrder}</CardDescription>
                  </div>
                </div>
                <Badge variant={statusConfig[order.status].variant}>{statusConfig[order.status].label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-text">
                <Package className="h-4 w-4 text-text/70" />
                <span className="font-medium text-text-h">{order.product}</span>
                <span className="text-text">• {order.quantity} pcs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text">
                <Calendar className="h-4 w-4 text-text/70" />
                <span>Due: {order.dueDate}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text">Stage</span>
                  <Badge variant={stageConfig[order.stage].variant}>{stageConfig[order.stage].label}</Badge>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-text">
                  <span>Progress</span>
                  <span>{order.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
