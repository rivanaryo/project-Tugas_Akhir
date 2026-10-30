import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';

interface SalesInvoiceFilterBarProps {
  q: string;
  status: string;
  invoice_date_from?: string;
  invoice_date_to?: string;
  onChange: (next: {
    q?: string;
    status?: string;
    invoice_date_from?: string;
    invoice_date_to?: string;
  }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function SalesInvoiceFilterBar({
  q,
  status,
  invoice_date_from,
  invoice_date_to,
  onChange,
  onReset,
  isLoading,
}: SalesInvoiceFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="sales-invoice-search">Search</Label>
            <Input
              id="sales-invoice-search"
              placeholder="Cari nomor invoice / customer"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-invoice-status-filter">Status</Label>
            <Select
              id="sales-invoice-status-filter"
              value={status}
              onChange={(e) => onChange({ status: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-invoice-date-from">Invoice Date From</Label>
            <Input
              id="sales-invoice-date-from"
              type="date"
              value={invoice_date_from}
              onChange={(e) => onChange({ invoice_date_from: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-invoice-date-to">Invoice Date To</Label>
            <Input
              id="sales-invoice-date-to"
              type="date"
              value={invoice_date_to}
              onChange={(e) => onChange({ invoice_date_to: e.target.value })}
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
