import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
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
import { SalesOrdersTable } from '../components/SalesOrdersTable';
import { SalesOrdersFilterBar } from '../components/SalesOrdersFilterBar';
import { useDeleteSalesOrder } from '../hooks/useDeleteSalesOrder';
import { useSalesOrderFilters } from '../hooks/useSalesOrderFilters';
import { useSalesOrders } from '../hooks/useSalesOrders';
import type { SalesOrderHead } from '../types/salesOrder.types';

export function SalesOrdersTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useSalesOrderFilters();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrderHead | null>(null);
  const [deletingSalesOrderId, setDeletingSalesOrderId] = useState<string | number | null>(null);
  const deleteSalesOrderMutation = useDeleteSalesOrder();

  const { data, isLoading, isError, isFetching } = useSalesOrders({ page, perPage, filters: queryFilters });
  const salesOrders = data?.items ?? [];
  const meta = data?.meta;

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

  const handleDeleteSalesOrder = (salesOrder: SalesOrderHead) => {
    setSelectedSalesOrder(salesOrder);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSalesOrder) return;

    try {
      setDeletingSalesOrderId(selectedSalesOrder.id);
      const result = await deleteSalesOrderMutation.mutateAsync(selectedSalesOrder.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedSalesOrder(null);
    } catch {
      toast.error('Gagal menghapus Sales Order');
    } finally {
      setDeletingSalesOrderId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/sales">Sales</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sales Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Sales Orders</CardTitle>
            <CardDescription>Kelola data Sales Order</CardDescription>
          </div>

          <Button asChild type="button" size="sm" className="gap-1.5">
            <Link to="/sales/sales-orders/create">
              <Plus className="h-4 w-4" />
              Tambah
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <SalesOrdersFilterBar
            q={uiFilters.q}
            status={uiFilters.status}
            order_date_from={uiFilters.order_date_from}
            order_date_to={uiFilters.order_date_to}
            onChange={updateFilters}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
          />

          <SalesOrdersTable
            data={salesOrders}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onDeleteSalesOrder={handleDeleteSalesOrder}
            deletingSalesOrderId={deletingSalesOrderId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} sales orders` : 'Menampilkan 0 sales orders'}
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
            setSelectedSalesOrder(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sales Order</DialogTitle>
            <DialogDescription>
              {selectedSalesOrder
                ? `Yakin ingin menghapus sales order "${selectedSalesOrder.order_number}"?`
                : 'Yakin ingin menghapus sales order ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteSalesOrderMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSalesOrderMutation.isPending || !selectedSalesOrder}
            >
              {deleteSalesOrderMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
