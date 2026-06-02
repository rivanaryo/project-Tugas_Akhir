import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { ExportButton } from '../../../../components/ui/ExportButton';
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
import { useVendors } from '../hooks/useVendors';
import { VendorsTable } from '../components/VendorsTable';
import { AddVendorDialog } from '../components/AddVendorDialog';
import { EditVendorDialog } from '../components/EditVendorDialog';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteVendor } from '../hooks/useDeleteVendor';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import { masterdataExportService } from '../../services/masterdataExportService';
import type { Vendor } from '../types/vendor.types';

export function VendorsTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingVendorId, setUpdatingVendorId] = useState<string | number | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEditVendor, setSelectedEditVendor] = useState<Vendor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const deleteVendorMutation = useDeleteVendor();

  const { data, isLoading, isError, isFetching } = useVendors({ page, perPage, filters: queryFilters });
  const vendors = data?.items ?? [];
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

  const handleDeleteVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setUpdatingVendorId(vendor.id);
    setSelectedEditVendor(vendor);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVendor) {
      return;
    }

    setDeletingVendorId(selectedVendor.id);

    try {
      const result = await deleteVendorMutation.mutateAsync(selectedVendor.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedVendor(null);
    } catch {
      toast.error('Failed to delete vendor. Please try again.');
    } finally {
      setDeletingVendorId(null);
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
              <BreadcrumbPage>Vendors</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
              Manage Data Vendors
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <ExportButton
              onExport={() => masterdataExportService.exportMasterdata('vendors', { q: uiFilters.q })}
              filename={`vendors-${new Date().toISOString().split('T')[0]}.xlsx`}
              disabled={isLoading || isFetching}
              size="sm"
              label="Export Excel"
            />
            <AddVendorDialog onCreated={() => setPage(1)} />
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
            placeholder="Cari nama vendor, kontak, email, atau telepon"
          />

          <VendorsTable
            data={vendors}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditVendor={handleEditVendor}
            onDeleteVendor={handleDeleteVendor}
            updatingVendorId={updatingVendorId}
            deletingVendorId={deletingVendorId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Showing ${meta.from}-${meta.to} of ${meta.total} vendors`
                : 'Showing 0 vendors'}
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
            setSelectedVendor(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Vendor</DialogTitle>
            <DialogDescription>
              {selectedVendor
                ? `Yakin ingin menghapus vendor "${selectedVendor.vendor_name}"?`
                : 'Yakin ingin menghapus vendor ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteVendorMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteVendorMutation.isPending || !selectedVendor}
            >
              {deleteVendorMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditVendorDialog
        open={isEditDialogOpen}
        vendor={selectedEditVendor}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedEditVendor(null);
            setUpdatingVendorId(null);
          }
        }}
      />
    </Card>
  );
}
