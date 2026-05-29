"use no memo";

import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { useAccounts } from '../../../masterdata/accounts/hooks/useAccounts';
import { useVendors } from '../../../masterdata/vendors/hooks/useVendors';
import { useDeleteVendorPayment } from '../hooks/useDeleteVendorPayment';
import { useVendorPayment } from '../hooks/useVendorPayment';
import { VENDOR_PAYMENT_STATUS_VARIANTS, getVendorPaymentStatusLabel } from '../constants/vendorPaymentStatus';

const formatDate = (value: string) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 'Rp 0';
  const numberValue = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numberValue);
};

export function VendorPaymentDetailPage() {
  "use no memo";

  const { vendorPaymentId } = useParams();
  const navigate = useNavigate();
  const deleteMutation = useDeleteVendorPayment();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: vendorPayment, isLoading, isError } = useVendorPayment(vendorPaymentId);

  const { data: vendorsData } = useVendors({ page: 1, perPage: 1000 });
  const { data: accountsData } = useAccounts({ page: 1, perPage: 1000 });

  const vendorName = useMemo(() => {
    if (!vendorPayment) return '';
    if (vendorPayment.vendor?.vendor_name) return vendorPayment.vendor.vendor_name;
    const matched = vendorsData?.items?.find((vendor) => String(vendor.id) === String(vendorPayment.vendor_id));
    return matched?.vendor_name ?? String(vendorPayment.vendor_id ?? '-');
  }, [vendorPayment, vendorsData?.items]);

  const accountLabel = useMemo(() => {
    if (!vendorPayment) return '';
    const fromPayload = vendorPayment.account;
    if (fromPayload?.account_name) {
      const suffix = fromPayload.account_number ? ` (${fromPayload.account_number})` : '';
      return `${fromPayload.account_name}${suffix}`;
    }
    const matched = accountsData?.items?.find((account) => String(account.id) === String(vendorPayment.account_id));
    if (matched) return `${matched.account_name} (${matched.account_number})`;
    return String(vendorPayment.account_id ?? '-');
  }, [vendorPayment, accountsData?.items]);

  const paymentTypeBadge = useMemo(() => {
    const type = vendorPayment?.payment_type;
    if (!type) return <Badge variant="default">-</Badge>;
    if (type === 'cash') return <Badge variant="success">Cash</Badge>;
    if (type === 'credit') return <Badge variant="warning">Credit</Badge>;
    return <Badge variant="default">Transfer</Badge>;
  }, [vendorPayment?.payment_type]);

  const statusBadge = useMemo(() => {
    const status = vendorPayment?.status;
    if (!status) return <Badge variant="default">-</Badge>;
    const variant = VENDOR_PAYMENT_STATUS_VARIANTS[status] || 'default';
    return <Badge variant={variant}>{getVendorPaymentStatusLabel(status)}</Badge>;
  }, [vendorPayment?.status]);

  const handleConfirmDelete = async () => {
    if (!vendorPayment) return;

    try {
      const result = await deleteMutation.mutateAsync(vendorPayment.id);
      toast.success(result.message);
      navigate('/purchase/vendor-payments');
    } catch {
      toast.error('Gagal menghapus pembayaran vendor');
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/purchase">Purchase</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/purchase/vendor-payments">Vendor Payments</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Vendor Payment Details</CardTitle>
            <CardDescription>Detail pembayaran vendor (read only)</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {vendorPayment && (
              <Button asChild type="button" variant="secondary" size="sm" className="h-9 w-9 p-0">
                <Link to={`/purchase/vendor-payments/${vendorPayment.id}/edit`} aria-label="Edit vendor payment">
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!vendorPayment || deleteMutation.isPending}
              aria-label="Delete vendor payment"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isError ? (
          <p className="text-sm text-red-600">Gagal memuat data pembayaran vendor.</p>
        ) : isLoading || !vendorPayment ? (
          <p className="text-sm text-text">Loading vendor payment...</p>
        ) : (
          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-h">Head</p>
                <p className="text-sm text-text">Informasi utama pembayaran vendor</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge}
                {paymentTypeBadge}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-text">Payment Number</p>
                <p className="text-sm font-semibold text-text-h">{vendorPayment.payment_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text">Payment Date</p>
                <p className="text-sm font-semibold text-text-h">{formatDate(vendorPayment.payment_date)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text">Vendor</p>
                <p className="text-sm font-semibold text-text-h">{vendorName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text">Invoice Vendor</p>
                <p className="text-sm font-semibold text-text-h">{vendorPayment.vendor_invoice_number}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-text">Account</p>
                <p className="text-sm font-semibold text-text-h">{accountLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text">Status</p>
                <p className="text-sm font-semibold text-text-h">{statusBadge}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text">Total Paid</p>
                <p className="metric-number text-2xl font-semibold text-text-h">
                  {formatCurrency(vendorPayment.total_paid)}
                </p>
              </div>
            </div>
          </section>
        )}
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pembayaran Vendor</DialogTitle>
            <DialogDescription>
              {vendorPayment
                ? `Yakin ingin menghapus pembayaran "${vendorPayment.payment_number}"?`
                : 'Yakin ingin menghapus pembayaran vendor ini?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
