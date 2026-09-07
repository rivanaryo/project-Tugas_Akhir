import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useWarehouses } from '../hooks/useWarehouses';
import { WarehousesTable } from '../components/WarehouseTable';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteWarehouse } from '../hooks/useDeleteWarehouse';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import type { Warehouse } from '../types/warehouse.types';
import { AddWarehouseDialog } from '../components/AddWarehouseDialog';
import { EditWarehouseDialog } from '../components/EditWarehouseDialog';

export function ProductsTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingWarehouseId] = useState<string | number | null>(null);
  const [deletingWarehouseId, setDeletingWarehouseId] = useState<string | number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const deleteWarehouseMutation = useDeleteWarehouse();

  const { data, isLoading, isError, isFetching } = useWarehouses({ page, perPage, filters: queryFilters });
  const warehouses = data?.items ?? [];
  const meta = data?.meta;

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  const handlePrevPage = () => {
    if (!canGoPrev) {
      return;
    }

    setPage(page - 1);
  };

  const handleNextPage = () => {
    if (!canGoNext || !meta) {
      return;
    }

    setPage(Math.min(meta.lastPage, page + 1));
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedWarehouse) {
      return;
    }

    setDeletingWarehouseId(selectedWarehouse.id);

    try {
      const result = await deleteWarehouseMutation.mutateAsync(selectedWarehouse.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedWarehouse(null);
    } catch {
      toast.error('Failed to delete warehouse. Please try again.');
    } finally {
      setDeletingWarehouseId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/masterdata">Masterdata</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gudang</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Gudang</CardTitle>
              <CardDescription>
                Manage Data Gudang
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AddWarehouseDialog onCreated={() => {}} />
            </div>
          </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MasterdataSearchBar
            value={uiFilters.q}
            onChange={(q) => updateFilters({ q })}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
            placeholder="Cari nama gudang"
          />

          <WarehousesTable
            data={warehouses}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditWarehouse={handleEditWarehouse}
            onDeleteWarehouse={handleDeleteWarehouse}
            updatingWarehouseId={updatingWarehouseId}
            deletingWarehouseId={deletingWarehouseId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Showing ${meta.from}-${meta.to} of ${meta.total} warehouses`
                : 'Showing 0 warehouses'}
            </p>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handlePrevPage} disabled={!canGoPrev}>
                Previous
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Page {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={handleNextPage} disabled={!canGoNext}>
                Next
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
            setSelectedWarehouse(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Gudang</DialogTitle>
            <DialogDescription>
              {selectedWarehouse
                ? `Yakin ingin menghapus gudang "${selectedWarehouse.name}"?`
                : 'Yakin ingin menghapus gudang ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteWarehouseMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteWarehouseMutation.isPending || !selectedWarehouse}
            >
              {deleteWarehouseMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditWarehouseDialog
        open={editDialogOpen}
        warehouse={editingWarehouse}
        onOpenChange={setEditDialogOpen}
      />
    </Card>
  );
}
