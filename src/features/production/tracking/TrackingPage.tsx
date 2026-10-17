import { useState } from 'react';
import type { DragEvent } from 'react';
import { GripVertical, Package, User, Calendar } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

interface KanbanCard {
  id: string;
  number: string;
  customer: string;
  product: string;
  quantity: number;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const initialColumns: Column[] = [
  {
    id: 'cutting',
    title: 'Cutting',
    color: 'border-blue-500/30 bg-blue-500/5',
    cards: [
      { id: '1', number: 'SPK-003', customer: 'Toko Distro', product: 'Crewneck Sweatshirt', quantity: 150, dueDate: 'Feb 20', priority: 'medium' },
      { id: '2', number: 'SPK-006', customer: 'PT. Retailindo', product: 'T-Shirt Cotton', quantity: 500, dueDate: 'Feb 25', priority: 'high' },
    ],
  },
  {
    id: 'printing',
    title: 'Printing/Bordir',
    color: 'border-amber-500/30 bg-amber-500/5',
    cards: [
      { id: '3', number: 'SPK-002', customer: 'CV. Berkah', product: 'Polo Shirt Pique', quantity: 200, dueDate: 'Feb 15', priority: 'high' },
    ],
  },
  {
    id: 'sewing',
    title: 'Sewing',
    color: 'border-amber-500/30 bg-amber-500/5',
    cards: [
      { id: '4', number: 'SPK-001', customer: 'PT. Maju Jaya', product: 'Hoodie Fleece', quantity: 100, dueDate: 'Feb 10', priority: 'high' },
      { id: '5', number: 'SPK-007', customer: 'Online Shop', product: 'Tote Bag Canvas', quantity: 300, dueDate: 'Feb 28', priority: 'low' },
    ],
  },
  {
    id: 'qc',
    title: 'QC & Packing',
    color: 'border-indigo-500/30 bg-indigo-500/5',
    cards: [
      { id: '6', number: 'SPK-004', customer: 'PT. Indo Fashion', product: 'Jaket Bomber', quantity: 50, dueDate: 'Feb 5', priority: 'high' },
    ],
  },
  {
    id: 'ready',
    title: 'Ready',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    cards: [
      { id: '7', number: 'SPK-005', customer: 'PT. Corporate', product: 'T-Shirt Cotton', quantity: 300, dueDate: 'Jan 25', priority: 'medium' },
    ],
  },
];

const priorityConfig = {
  low: { label: 'Low', variant: 'secondary' as const },
  medium: { label: 'Medium', variant: 'warning' as const },
  high: { label: 'High', variant: 'danger' as const },
};

export function TrackingPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: string, fromColumnId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId, fromColumnId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, toColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    try {
      const { cardId, fromColumnId } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (fromColumnId === toColumnId) return;

      setColumns((prev) => {
        const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
        const fromCol = next.find((c) => c.id === fromColumnId);
        const toCol = next.find((c) => c.id === toColumnId);
        if (!fromCol || !toCol) return prev;
        const cardIndex = fromCol.cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return prev;
        const [card] = fromCol.cards.splice(cardIndex, 1);
        toCol.cards.push(card);
        return next;
      });
    } catch {
      // ignore invalid drop payloads
    }
  };

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Production Tracking</CardTitle>
              <CardDescription>
                Kanban board untuk memantau pengerjaan SPK konveksi per tahap produksi. Drag card antar kolom untuk update tahap.
              </CardDescription>
            </div>
            <Badge variant="default">Production</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragLeave={() => setDragOverColumn((cur) => (cur === column.id ? null : cur))}
            className={cn(
              'flex min-w-[300px] flex-col rounded-2xl border-2 p-3 transition-colors',
              column.color,
              dragOverColumn === column.id && 'border-accent/60 bg-accent/5'
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-text-h">{column.title}</h3>
              <Badge variant="secondary">{column.cards.length}</Badge>
            </div>
            <div className="min-h-40 space-y-3">
              {column.cards.map((card) => (
                <Card
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id, column.id)}
                  className="cursor-grab border-border/50 bg-surface-1 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-text/50" />
                        <span className="font-mono text-sm font-semibold text-accent">{card.number}</span>
                      </div>
                      <Badge variant={priorityConfig[card.priority].variant}>
                        {priorityConfig[card.priority].label}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-text/70" />
                        <span className="text-text">{card.customer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-text/70" />
                        <span className="font-medium text-text-h">{card.product}</span>
                        <span className="text-text">• {card.quantity} pcs</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-text/70" />
                        <span className="text-text">Due: {card.dueDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {column.cards.length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border/70 text-xs text-text">
                  Drop SPK di sini
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-text">
            Drag & drop card untuk memindahkan antar tahap. Total orders in progress: <span className="font-semibold text-text-h">{totalCards} orders</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
