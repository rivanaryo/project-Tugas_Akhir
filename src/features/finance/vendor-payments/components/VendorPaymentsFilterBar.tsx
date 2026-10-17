import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';

interface VendorPaymentsFilterBarProps {
  q: string;
  vendor_id?: string;
  payment_type?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  account_id?: string;
  onChange: (next: {
    q?: string;
    vendor_id?: string;
    payment_type?: string;
    payment_date_from?: string;
    payment_date_to?: string;
    account_id?: string;
  }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function VendorPaymentsFilterBar({
  q,
  vendor_id,
  payment_type,
  payment_date_from,
  payment_date_to,
  account_id,
  onChange,
  onReset,
  isLoading,
}: VendorPaymentsFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="vp-search">Search</Label>
            <Input
              id="vp-search"
              placeholder="Cari nomor pembayaran / invoice / vendor"
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vp-vendor-filter">Vendor</Label>
            <Input
              id="vp-vendor-filter"
              placeholder="ID Vendor"
              value={vendor_id || ''}
              onChange={(e) => onChange({ vendor_id: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vp-payment-type-filter">Payment Type</Label>
            <Select
              id="vp-payment-type-filter"
              value={payment_type || ''}
              onChange={(e) => onChange({ payment_type: e.target.value })}
              disabled={isLoading}
            >
              <option value="">Semua</option>
              <option value="transfer">Transfer</option>
              <option value="cash">Cash</option>
              <option value="giro">Giro</option>
              <option value="downpayment">Down Payment</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vp-date-from">Payment Date From</Label>
            <Input
              id="vp-date-from"
              type="date"
              value={payment_date_from || ''}
              onChange={(e) => onChange({ payment_date_from: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vp-date-to">Payment Date To</Label>
            <Input
              id="vp-date-to"
              type="date"
              value={payment_date_to || ''}
              onChange={(e) => onChange({ payment_date_to: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vp-account-filter">Account</Label>
            <Input
              id="vp-account-filter"
              placeholder="ID Account"
              value={account_id || ''}
              onChange={(e) => onChange({ account_id: e.target.value })}
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