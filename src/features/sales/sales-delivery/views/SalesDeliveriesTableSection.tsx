import { useState, useEffect, useRef } from 'react';
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
import { SalesDeliveryTable } from '../components/SalesDeliveryTable';
import { SalesDeliveryFilterBar } from '../components/SalesDeliveryFilterBar';
import { useDeleteSalesDelivery } from '../hooks/useDeleteSalesDelivery';
import { useSalesDeliveryFilters } from '../hooks/useSalesDeliveryFilters';
import { useSalesDeliveries } from '../hooks/useSalesDeliveries';
import type { SalesDeliveryHead } from '../types/salesDelivery.types';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';

export function SalesDeliveriesTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useSalesDeliveryFilters();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSalesDelivery, setSelectedSalesDelivery] = useState<SalesDeliveryHead | null>(null);
  const [deletingSalesDeliveryId, setDeletingSalesDeliveryId] = useState<string | number | null>(null);
  const [localSearch, setLocalSearch] = useState(uiFilters.q || '');
  const debouncedSearch = useDebouncedValue(localSearch, 500);
  const deleteSalesDeliveryMutation = useDeleteSalesDelivery();

  const { data, isLoading, isError, isFetching } = useSalesDeliveries({ page, perPage, filters: queryFilters });
  const salesDeliveries = data?.items ?? [];
  const meta = data?.meta;

  // Sync local search when uiFilters.q changes (e.g. from Reset button)
  const lastUrlQ = useRef(uiFilters.q);
  useEffect(() => {
    if (uiFilters.q !== lastUrlQ.current) {
      setLocalSearch(uiFilters.q);
      lastUrlQ.current = uiFilters.q;
    }
  }, [uiFilters.q]);

  useEffect(() => {
    if (debouncedSearch !== uiFilters.q) {
      updateFilters({ q: debouncedSearch });
      lastUrlQ.current = debouncedSearch;
    }
  }, [debouncedSearch, updateFilters, uiFilters.q]);

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

  const handleDeleteSalesDelivery = (salesDelivery: SalesDeliveryHead) => {
    setSelectedSalesDelivery(salesDelivery);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSalesDelivery) return;

    try {
      setDeletingSalesDeliveryId(selectedSalesDelivery.id);
      const result = await deleteSalesDeliveryMutation.mutateAsync(selectedSalesDelivery.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedSalesDelivery(null);
    } catch {
      toast.error('Gagal menghapus Sales Delivery');
    } finally {
      setDeletingSalesDeliveryId(null);
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
              <BreadcrumbPage>Sales Deliveries</BreadcrumbPage> 
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Sales Deliveries</CardTitle>
            <CardDescription>Kelola data Sales Delivery</CardDescription>
          </div>

          <Button asChild type="button" size="sm" className="gap-1.5">
            <Link to="/sales/sales-deliveries/create">
              <Plus className="h-4 w-4" />
              Tambah
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <SalesDeliveryFilterBar
            q={localSearch}
            status={uiFilters.status}
            delivery_date_from={uiFilters.delivery_date_from}
            delivery_date_to={uiFilters.delivery_date_to}
            onChange={(next) => {
              if (next.q !== undefined) {
                setLocalSearch(next.q);
              } else {
                updateFilters(next);
              }
            }}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
          />

          <SalesDeliveryTable
            data={salesDeliveries}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onDeleteSalesDelivery={handleDeleteSalesDelivery}
            deletingSalesDeliveryId={deletingSalesDeliveryId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} sales deliveries` : 'Menampilkan 0 sales deliveries'}
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
            setSelectedSalesDelivery(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sales Delivery</DialogTitle>
            <DialogDescription>
              {selectedSalesDelivery
                ? `Yakin ingin menghapus sales delivery "${selectedSalesDelivery.delivery_number}"?`
                : 'Yakin ingin menghapus sales delivery ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteSalesDeliveryMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSalesDeliveryMutation.isPending || !selectedSalesDelivery}
            >
              {deleteSalesDeliveryMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
