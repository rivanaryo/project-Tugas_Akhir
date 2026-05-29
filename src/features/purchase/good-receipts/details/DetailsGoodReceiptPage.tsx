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
import { GoodReceiptItemsTable } from '../components/GoodReceiptItemsTable';
import { useDeleteGoodReceipt } from '../hooks/useDeleteGoodReceipt';
import { useGoodReceipt } from '../hooks/useGoodReceipt';
import { useGoodReceiptItems } from '../hooks/useGoodReceiptItems';

const formatDate = (value: string) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

const formatMoney = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const numberValue = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue);
};

export function DetailsGoodReceiptPage() {
  "use no memo";

  const { goodReceiptId } = useParams();
  const navigate = useNavigate();
  const deleteMutation = useDeleteGoodReceipt();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: goodReceipt, isLoading: isHeadLoading, isError: isHeadError } = useGoodReceipt(goodReceiptId);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError, isFetching: isItemsFetching } =
    useGoodReceiptItems({
      goodReceiptId,
      page: 1,
      perPage: 100,
    });

  const items = itemsData?.items ?? [];

  const totalValue = useMemo(() => {
    return items.reduce((total, item) => {
      const qtyReceived = Number(item.qty_received ?? 0);
      const unitPrice = Number(item.purchase_order_item?.unit_price ?? 0);
      if (!Number.isFinite(qtyReceived) || !Number.isFinite(unitPrice)) return total;
      return total + qtyReceived * unitPrice;
    }, 0);
  }, [items]);

  const handleConfirmDelete = async () => {
    if (!goodReceipt) return;

    try {
      const result = await deleteMutation.mutateAsync(goodReceipt.id);
      toast.success(result.message);
      navigate('/purchase/good-receipts');
    } catch {
      toast.error('Gagal menghapus Good Receipt');
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
                <Link to="/purchase/good-receipts">Good Receipts</Link>
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
            <CardTitle>Good Receipt Details</CardTitle>
            <CardDescription>Detail Good Receipt (read only)</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {goodReceipt && (
              <Button asChild type="button" variant="secondary" size="sm" className="h-9 w-9 p-0">
                <Link to={`/purchase/good-receipts/${goodReceipt.id}/edit`} aria-label="Edit good receipt">
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
              disabled={!goodReceipt || deleteMutation.isPending}
              aria-label="Delete good receipt"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isHeadError ? (
          <p className="text-sm text-red-600">Gagal memuat data good receipt.</p>
        ) : isHeadLoading || !goodReceipt ? (
          <p className="text-sm text-text">Loading good receipt...</p>
        ) : (
          <>
            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-h">Head</p>
                  <p className="text-sm text-text">Informasi utama Good Receipt</p>
                </div>
                {goodReceipt.status === 'completed' ? (
                  <Badge variant="success">Completed</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-text">GR Number</p>
                  <p className="text-sm font-semibold text-text-h">{goodReceipt.gr_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Receipt Date</p>
                  <p className="text-sm font-semibold text-text-h">{formatDate(goodReceipt.receipt_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">PO Number</p>
                  <p className="text-sm font-semibold text-text-h">
                    {goodReceipt.purchase_order?.po_number ?? String(goodReceipt.purchase_order_id ?? '-')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Vendor</p>
                  <p className="text-sm font-semibold text-text-h">
                    {goodReceipt.vendor?.vendor_name ?? String(goodReceipt.vendor_id ?? '-')}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-h">Good Receipt Items</p>
                  <p className="text-sm text-text">Daftar item pada Good Receipt</p>
                </div>
                <p className="text-xs text-text">
                  {isItemsFetching ? 'Memuat...' : itemsData?.meta ? `Total ${itemsData.meta.total} item` : ''}
                </p>
              </div>

              <GoodReceiptItemsTable
                data={items}
                isLoading={isItemsLoading}
                isError={isItemsError}
                rowStartNumber={itemsData?.meta.from ?? 1}
              />
            </section>

            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-h">Total</p>
                  <p className="text-sm text-text">Total value (qty received × unit price)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text">Total Value</p>
                  <p className="metric-number text-2xl font-semibold text-text-h">{formatMoney(totalValue)}</p>
                </div>
              </div>
            </section>
          </>
        )}
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Good Receipt</DialogTitle>
            <DialogDescription>
              {goodReceipt ? `Yakin ingin menghapus good receipt "${goodReceipt.gr_number}"?` : 'Yakin ingin menghapus good receipt ini?'}
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

