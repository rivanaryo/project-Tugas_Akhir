import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';

interface SalesOrdersFilterBarProps {
  q: string;
  status: string;
  customer_id?: string;
  order_date_from?: string;
  order_date_to?: string;
  onChange: (next: {
    q?: string;
    status?: string;
    customer_id?: string;
    order_date_from?: string;
    order_date_to?: string;
  }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function SalesOrdersFilterBar({
  q,
  status,
  order_date_from,
  order_date_to,
  onChange,
  onReset,
  isLoading,
}: SalesOrdersFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="so-search">Search</Label>
            <Input
              id="so-search"
              placeholder="Cari nomor SO / customer"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="so-status-filter">Status</Label>
            <Select
              id="so-status-filter"
              value={status}
              onChange={(e) => onChange({ status: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Semua</option>
              <option value="0">Pending</option>
              <option value="1">Completed</option>
              <option value="2">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="so-date-from">Order Date From</Label>
            <Input
              id="so-date-from"
              type="date"
              value={order_date_from}
              onChange={(e) => onChange({ order_date_from: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="so-date-to">Order Date To</Label>
            <Input
              id="so-date-to"
              type="date"
              value={order_date_to}
              onChange={(e) => onChange({ order_date_to: e.target.value })}
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
