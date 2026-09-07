import { Button } from '../../../../components/ui/button';
import { ExportButton } from '../../../../components/ui/ExportButton';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderFilterParams } from '../types/purchaseOrder.types';

interface PurchaseOrdersFilterBarProps {
  q: string;
  status: string;
  vendor_id?: string;
  po_date_from?: string;
  po_date_to?: string;
  onChange: (next: {
    q?: string;
    status?: string;
    vendor_id?: string;
    po_date_from?: string;
    po_date_to?: string;
  }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function PurchaseOrdersFilterBar({
  q,
  status,
  po_date_from,
  po_date_to,
  onChange,
  onReset,
  isLoading,
}: PurchaseOrdersFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="po-search">Search</Label>
            <Input
              id="po-search"
              placeholder="Cari nomor PO / vendor"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="po-status-filter">Status</Label>
            <Select
              id="po-status-filter"
              value={status}
              onChange={(e) => onChange({ status: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Semua</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="po-date-from">PO Date From</Label>
            <Input
              id="po-date-from"
              type="date"
              value={po_date_from}
              onChange={(e) => onChange({ po_date_from: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="po-date-to">PO Date To</Label>
            <Input
              id="po-date-to"
              type="date"
              value={po_date_to}
              onChange={(e) => onChange({ po_date_to: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <ExportButton
            onExport={() => purchaseOrderService.exportPurchaseOrders({ q, status: status as PurchaseOrderFilterParams['status'], po_date_from, po_date_to })}
            filename={`purchase-orders-${new Date().toISOString().split('T')[0]}.xlsx`}
            disabled={isLoading}
            size="sm"
          />
          <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
            Reset Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
