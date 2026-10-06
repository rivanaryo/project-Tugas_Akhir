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
import { useDeletePurchaseOrder } from '../hooks/useDeletePurchaseOrder';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';
import { usePurchaseOrderItems } from '../hooks/usePurchaseOrderItems';
import { PurchaseOrderItemsTable } from '../components/PurchaseOrderItemsTable';

const formatDate = (value: string) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

const formatMoney = (value: string | number | null | undefined) => {
  const numberValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = numberValue !== null && numberValue !== undefined && Number.isFinite(numberValue) ? numberValue : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export function DetailsPurchaseOrderPage() {
  const { purchaseOrderId } = useParams();
  const navigate = useNavigate();
  const deleteMutation = useDeletePurchaseOrder();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: purchaseOrder, isLoading: isHeadLoading, isError: isHeadError } = usePurchaseOrder(purchaseOrderId);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError, isFetching: isItemsFetching } =
    usePurchaseOrderItems({
      purchaseOrderId,
      page: 1,
      perPage: 100,
    });

  const items = itemsData?.items ?? [];

  const computedTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const explicitTotal = item.total_price;
      const explicitTotalNumber = explicitTotal !== null && explicitTotal !== undefined ? Number(explicitTotal) : 0;
      if (Number.isFinite(explicitTotalNumber)) return total + explicitTotalNumber;

      const qty = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unit_price ?? 0);
      const taxAmount = Number(item.tax_amount ?? 0);
      
      if (!Number.isFinite(qty) || !Number.isFinite(unitPrice)) return total;
      
      const subtotal = qty * unitPrice;
      return total + subtotal + taxAmount;
    }, 0);
  }, [items]);

  const totalPrice = purchaseOrder?.total_price ?? computedTotal;

  const handleConfirmDelete = async () => {
    if (!purchaseOrder) return;

    try {
      const result = await deleteMutation.mutateAsync(purchaseOrder.id);
      toast.success(result.message);
      navigate('/inventory/purchase-orders');
    } catch {
      toast.error('Gagal menghapus Purchase Order');
    }
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
              <BreadcrumbLink asChild>
                <Link to="/inventory/purchase-orders">Purchase Orders</Link>
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
            <CardTitle>Purchase Order Details</CardTitle>
            <CardDescription>Detail Purchase Order (read only)</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {purchaseOrder && (
              <Button asChild type="button" variant="secondary" size="sm" className="h-9 w-9 p-0">
                <Link to={`/inventory/purchase-orders/${purchaseOrder.id}/edit`} aria-label="Edit purchase order">
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
              disabled={!purchaseOrder || deleteMutation.isPending}
              aria-label="Delete purchase order"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isHeadError ? (
          <p className="text-sm text-red-600">Gagal memuat data purchase order.</p>
        ) : isHeadLoading || !purchaseOrder ? (
          <p className="text-sm text-text">Loading purchase order...</p>
        ) : (
          <>
            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-h">Head</p>
                  <p className="text-sm text-text">Informasi utama Purchase Order</p>
                </div>
                {purchaseOrder.status === 'completed' ? (
                  <Badge variant="success">Completed</Badge>
                ) : purchaseOrder.status === 'pending' ? (
                  <Badge variant="warning">Pending</Badge>
                ) : purchaseOrder.status === 'partially_received' ? (
                <Badge variant="default">Partially Received</Badge>
              ) : purchaseOrder.status === 'cancelled' ? (
                  <Badge variant="danger">Cancelled</Badge>
                ) : (
                  <Badge variant="default">Draft</Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-text">PO Number</p>
                  <p className="text-sm font-semibold text-text-h">{purchaseOrder.po_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">PO Date</p>
                  <p className="text-sm font-semibold text-text-h">{formatDate(purchaseOrder.po_date)}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-text">Vendor</p>
                  <p className="text-sm font-semibold text-text-h">
                    {purchaseOrder.vendor?.vendor_name ?? String(purchaseOrder.vendor_id)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-h">Purchase Order Items</p>
                  <p className="text-sm text-text">Daftar item pada Purchase Order</p>
                </div>
                <p className="text-xs text-text">
                  {isItemsFetching ? 'Memuat...' : itemsData?.meta ? `Total ${itemsData.meta.total} item` : ''}
                </p>
              </div>

              <PurchaseOrderItemsTable
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
                  <p className="text-sm text-text">Total harga Purchase Order</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text">Total Price</p>
                  <p className="metric-number text-2xl font-semibold text-text-h">{formatMoney(totalPrice)}</p>
                </div>
              </div>
            </section>
          </>
        )}
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Purchase Order</DialogTitle>
            <DialogDescription>
              {purchaseOrder ? `Yakin ingin menghapus purchase order "${purchaseOrder.po_number}"?` : 'Yakin ingin menghapus purchase order ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending || !purchaseOrder}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
