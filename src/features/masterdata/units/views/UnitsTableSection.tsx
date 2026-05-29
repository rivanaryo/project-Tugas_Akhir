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
import { useUnits } from '../hooks/useUnits';
import { UnitsTable } from '../components/UnitsTable';
import { AddUnitDialog } from '../components/AddUnitDialog';
import { EditUnitDialog } from '../components/EditUnitDialog';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteUnit } from '../hooks/useDeleteUnit';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import type { Unit } from '../types/unit.types';

export function UnitsTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingUnitId, setUpdatingUnitId] = useState<string | number | null>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEditUnit, setSelectedEditUnit] = useState<Unit | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const deleteUnitMutation = useDeleteUnit();

  const { data, isLoading, isError, isFetching } = useUnits({ page, perPage, filters: queryFilters });
  const units = data?.items ?? [];
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

  const handleDeleteUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setUpdatingUnitId(unit.id);
    setSelectedEditUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUnit) {
      return;
    }

    setDeletingUnitId(selectedUnit.id);

    try {
      const result = await deleteUnitMutation.mutateAsync(selectedUnit.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedUnit(null);
    } catch {
      toast.error('Failed to delete unit. Please try again.');
    } finally {
      setDeletingUnitId(null);
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
              <BreadcrumbPage>Units</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Units</CardTitle>
              <CardDescription>
                Manage Data Units
              </CardDescription>
            </div>

            <AddUnitDialog onCreated={() => setPage(1)} />
          </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MasterdataSearchBar
            value={uiFilters.q}
            onChange={(q) => updateFilters({ q })}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
            placeholder="Cari nama atau kode unit"
          />

          <UnitsTable
            data={units}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditUnit={handleEditUnit}
            onDeleteUnit={handleDeleteUnit}
            updatingUnitId={updatingUnitId}
            deletingUnitId={deletingUnitId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Showing ${meta.from}-${meta.to} of ${meta.total} units`
                : 'Showing 0 units'}
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
            setSelectedUnit(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Unit</DialogTitle>
            <DialogDescription>
              {selectedUnit
                ? `Yakin ingin menghapus unit "${selectedUnit.unit_name}"?`
                : 'Yakin ingin menghapus unit ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteUnitMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteUnitMutation.isPending || !selectedUnit}
            >
              {deleteUnitMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditUnitDialog
        open={isEditDialogOpen}
        unit={selectedEditUnit}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedEditUnit(null);
            setUpdatingUnitId(null);
          }
        }}
      />
    </Card>
  );
}
