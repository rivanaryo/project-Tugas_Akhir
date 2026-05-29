import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQueries } from '@tanstack/react-query';
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
import { PurchaseOrdersTable } from '../components/PurchaseOrdersTable';
import { PurchaseOrdersFilterBar } from '../components/PurchaseOrdersFilterBar';
import { useDeletePurchaseOrder } from '../hooks/useDeletePurchaseOrder';
import { usePurchaseOrderFilters } from '../hooks/usePurchaseOrderFilters';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import type { PurchaseOrderHead } from '../types/purchaseOrder.types';
import { purchaseOrderService } from '../services/purchaseOrderService';

export function PurchaseOrdersTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = usePurchaseOrderFilters();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrderHead | null>(null);
  const [deletingPurchaseOrderId, setDeletingPurchaseOrderId] = useState<string | number | null>(null);
  const deletePurchaseOrderMutation = useDeletePurchaseOrder();

  const { data, isLoading, isError, isFetching } = usePurchaseOrders({ page, perPage, filters: queryFilters });
  const purchaseOrders = data?.items ?? [];
  const meta = data?.meta;

  const purchaseOrderItemsQueries = useQueries({
    queries: purchaseOrders.map((po) => ({
      queryKey: ['purchase', 'purchase-order-items', 'summary', po.id],
      queryFn: () => purchaseOrderService.fetchPurchaseOrderItems(po.id, 1, 100),
      enabled: purchaseOrders.length > 0,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    })),
  });

  const itemsSummaryByPurchaseOrderId = purchaseOrders.reduce<
    Record<string, { itemCount: number; products: string[]; totalPrice: number }>
  >((acc, po, index) => {
    const query = purchaseOrderItemsQueries[index];
    const items = query?.data?.items ?? [];

    const products = Array.from(
      new Set(
        items
          .map((item) => item.pricelist?.product?.product_name ?? String(item.product_id ?? ''))
          .filter((name) => name)
      )
    );

    const totalPrice = items.reduce((total, item) => {
      const explicitTotal = item.total_price;
      const explicitTotalNumber = explicitTotal !== null && explicitTotal !== undefined ? Number(explicitTotal) : NaN;
      if (Number.isFinite(explicitTotalNumber)) return total + explicitTotalNumber;

      const qty = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unit_price ?? 0);
      if (!Number.isFinite(qty) || !Number.isFinite(unitPrice)) return total;
      return total + qty * unitPrice;
    }, 0);

    acc[String(po.id)] = {
      itemCount: items.length,
      products,
      totalPrice,
    };

    return acc;
  }, {});

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  const handlePrevPage = () => {
    if (!canGoPrev) return;
    setPage(Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    if (!canGoNext || !meta) return;
    setPage(Math.min(meta.lastPage, page + 1));
  };

  const handleDeletePurchaseOrder = (purchaseOrder: PurchaseOrderHead) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPurchaseOrder) return;

    try {
      setDeletingPurchaseOrderId(selectedPurchaseOrder.id);
      const result = await deletePurchaseOrderMutation.mutateAsync(selectedPurchaseOrder.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedPurchaseOrder(null);
    } catch {
      toast.error('Gagal menghapus Purchase Order');
    } finally {
      setDeletingPurchaseOrderId(null);
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
              <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>Kelola data Purchase Order</CardDescription>
          </div>

          <Button asChild type="button" size="sm" className="gap-1.5">
            <Link to="/purchase/purchase-orders/create">
              <Plus className="h-4 w-4" />
              Tambah
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <PurchaseOrdersFilterBar
            q={uiFilters.q}
            status={uiFilters.status}
            po_date_from={uiFilters.po_date_from}
            po_date_to={uiFilters.po_date_to}
            onChange={updateFilters}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
          />

          <PurchaseOrdersTable
            data={purchaseOrders}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onDeletePurchaseOrder={handleDeletePurchaseOrder}
            deletingPurchaseOrderId={deletingPurchaseOrderId}
            itemsSummaryByPurchaseOrderId={itemsSummaryByPurchaseOrderId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} purchase orders` : 'Menampilkan 0 purchase orders'}
            </p>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handlePrevPage} disabled={!canGoPrev}>
                Sebelumnya
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={handleNextPage} disabled={!canGoNext}>
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
          if (!open) {
            setSelectedPurchaseOrder(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Purchase Order</DialogTitle>
            <DialogDescription>
              {selectedPurchaseOrder
                ? `Yakin ingin menghapus purchase order "${selectedPurchaseOrder.po_number}"?`
                : 'Yakin ingin menghapus purchase order ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deletePurchaseOrderMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletePurchaseOrderMutation.isPending || !selectedPurchaseOrder}
            >
              {deletePurchaseOrderMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
