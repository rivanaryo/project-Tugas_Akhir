import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { VendorPaymentsFilterBar } from '../components/VendorPaymentsFilterBar';
import { VendorPaymentsTable } from '../components/VendorPaymentsTable';
import { useDeleteVendorPayment } from '../hooks/useDeleteVendorPayment';
import { useVendorPaymentFilters } from '../hooks/useVendorPaymentFilters';
import { useVendorPayments } from '../hooks/useVendorPayments';
import type { VendorPayment } from '../types/VendorPayment';

export function VendorPaymentsTableSection() {
  const {
    page,
    perPage,
    q,
    vendorId,
    paymentType,
    paymentDateFrom,
    paymentDateTo,
    accountId,
    queryFilters,
    setPage,
    updateSearch,
    updateVendorId,
    updatePaymentType,
    updatePaymentDateFrom,
    updatePaymentDateTo,
    updateAccountId,
    resetFilters
  } = useVendorPaymentFilters();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVendorPayment, setSelectedVendorPayment] = useState<VendorPayment | null>(null);
  const [deletingVendorPaymentId, setDeletingVendorPaymentId] = useState<string | number | null>(null);
  const deleteVendorPaymentMutation = useDeleteVendorPayment();

  const { data, isLoading, isError, isFetching } = useVendorPayments({
    page,
    perPage,
    filters: queryFilters
  });

  const vendorPayments = data?.items ?? [];
  const meta = data?.meta;

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  const handleDeleteVendorPayment = (vendorPayment: VendorPayment) => {
    setSelectedVendorPayment(vendorPayment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVendorPayment) return;
    try {
      setDeletingVendorPaymentId(selectedVendorPayment.id);
      const result = await deleteVendorPaymentMutation.mutateAsync(selectedVendorPayment.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedVendorPayment(null);
    } catch {
      toast.error('Gagal menghapus pembayaran vendor');
    } finally {
      setDeletingVendorPaymentId(null);
    }
  };

  const handleFilterChange = (updates: {
    q?: string;
    vendor_id?: string;
    payment_type?: string;
    payment_date_from?: string;
    payment_date_to?: string;
    account_id?: string;
  }) => {
    if (updates.q !== undefined) updateSearch(updates.q);
    if (updates.vendor_id !== undefined) updateVendorId(updates.vendor_id);
    if (updates.payment_type !== undefined) updatePaymentType(updates.payment_type as 'transfer' | 'cash' | 'credit' | '');
    if (updates.payment_date_from !== undefined) updatePaymentDateFrom(updates.payment_date_from);
    if (updates.payment_date_to !== undefined) updatePaymentDateTo(updates.payment_date_to);
    if (updates.account_id !== undefined) updateAccountId(updates.account_id);
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inventory/purchase-orders">Purchase</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vendor Payments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Vendor Payments</CardTitle>
            <CardDescription>Kelola data pembayaran vendor</CardDescription>
          </div>
          <Button asChild type="button" size="sm" className="gap-1.5">
            <Link to="/finance/vendor-payments/create">
              <Plus className="h-4 w-4" />
              Tambah
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <VendorPaymentsFilterBar
            q={q}
            vendor_id={vendorId}
            payment_type={paymentType}
            payment_date_from={paymentDateFrom}
            payment_date_to={paymentDateTo}
            account_id={accountId}
            onChange={handleFilterChange}
            onReset={resetFilters}
            isLoading={isLoading}
          />

          <VendorPaymentsTable
            data={vendorPayments}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onDeleteVendorPayment={handleDeleteVendorPayment}
            deletingVendorPaymentId={deletingVendorPaymentId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} pembayaran vendor` : 'Menampilkan 0 pembayaran vendor'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!canGoPrev}
              >
                Sebelumnya
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => meta && setPage(Math.min(meta.lastPage, page + 1))}
                disabled={!canGoNext}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedVendorPayment(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pembayaran Vendor</DialogTitle>
            <DialogDescription>
              {selectedVendorPayment
                ? `Yakin ingin menghapus pembayaran "${selectedVendorPayment.payment_number}"?`
                : 'Yakin ingin menghapus pembayaran vendor ini?'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteVendorPaymentMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteVendorPaymentMutation.isPending || !selectedVendorPayment}
            >
              {deleteVendorPaymentMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
