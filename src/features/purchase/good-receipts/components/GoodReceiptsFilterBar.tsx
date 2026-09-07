import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';

interface GoodReceiptsFilterBarProps {
  q: string;
  status: string;
  receipt_date_from?: string;
  receipt_date_to?: string;
  onChange: (next: {
    q?: string;
    status?: string;
    receipt_date_from?: string;
    receipt_date_to?: string;
  }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function GoodReceiptsFilterBar({
  q,
  status,
  receipt_date_from,
  receipt_date_to,
  onChange,
  onReset,
  isLoading,
}: GoodReceiptsFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="gr-search">Search</Label>
            <Input
              id="gr-search"
              placeholder="Cari nomor GR / nomor PO / vendor"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gr-status-filter">Status</Label>
            <Select id="gr-status-filter" value={status} onChange={(e) => onChange({ status: e.target.value })} disabled={isLoading}>
              <option value="">Semua</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gr-date-from">Receipt Date From</Label>
            <Input id="gr-date-from" type="date" value={receipt_date_from} onChange={(e) => onChange({ receipt_date_from: e.target.value })} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gr-date-to">Receipt Date To</Label>
            <Input id="gr-date-to" type="date" value={receipt_date_to} onChange={(e) => onChange({ receipt_date_to: e.target.value })} disabled={isLoading} />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>Reset Filter</Button>
        </div>
      </div>
    </div>
  );
}
