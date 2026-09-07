import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';

interface SalesDeliveryFilterBarProps {
  q: string;
  status: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  onChange: (next: {
    q?: string;
    status?: string;
    delivery_date_from?: string;
    delivery_date_to?: string;
  }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function SalesDeliveryFilterBar({
  q,
  status,
  delivery_date_from,
  delivery_date_to,
  onChange,
  onReset,
  isLoading,
}: SalesDeliveryFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="delivery-search">Search</Label>
            <Input
              id="delivery-search"
              placeholder="Cari nomor delivery / customer"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-status-filter">Status</Label>
            <Select
              id="delivery-status-filter"
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
            <Label htmlFor="delivery-date-from">Delivery Date From</Label>
            <Input
              id="delivery-date-from"
              type="date"
              value={delivery_date_from}
              onChange={(e) => onChange({ delivery_date_from: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-date-to">Delivery Date To</Label>
            <Input
              id="delivery-date-to"
              type="date"
              value={delivery_date_to}
              onChange={(e) => onChange({ delivery_date_to: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
            Reset Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
