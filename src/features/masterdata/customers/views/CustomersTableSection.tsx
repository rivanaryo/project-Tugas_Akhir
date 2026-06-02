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
import { useCustomers } from '../hooks/useCustomers';
import { CustomersTable } from '../components/CustomersTable';
import { AddCustomerDialog } from '../components/AddCustomerDialog';
import { EditCustomerDialog } from '../components/EditCustomerDialog';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import { masterdataExportService } from '../../services/masterdataExportService';
import type { Customer } from '../types/customer.types';

export function CustomersTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingCustomerId, setUpdatingCustomerId] = useState<string | number | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEditCustomer, setSelectedEditCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const deleteCustomerMutation = useDeleteCustomer();

  const { data, isLoading, isError, isFetching } = useCustomers({ page, perPage, filters: queryFilters });
  const customers = data?.items ?? [];
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

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setUpdatingCustomerId(customer.id);
    setSelectedEditCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) {
      return;
    }

    setDeletingCustomerId(selectedCustomer.id);

    try {
      const result = await deleteCustomerMutation.mutateAsync(selectedCustomer.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch {
      toast.error('Gagal menghapus customer. Silakan coba lagi.');
    } finally {
      setDeletingCustomerId(null);
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
              <BreadcrumbPage>Customers</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              Kelola Data Customers
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <ExportButton
              onExport={() => masterdataExportService.exportMasterdata('customers', { q: uiFilters.q })}
              filename={`customers-${new Date().toISOString().split('T')[0]}.xlsx`}
              disabled={isLoading || isFetching}
              size="sm"
              label="Export Excel"
            />
            <AddCustomerDialog onCreated={() => setPage(1)} />
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
            placeholder="Cari nama customer, kontak, email, atau telepon"
          />

          <CustomersTable
            data={customers}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            updatingCustomerId={updatingCustomerId}
            deletingCustomerId={deletingCustomerId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} customers`
                : 'Menampilkan 0 customers'}
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
            setSelectedCustomer(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Customer</DialogTitle>
            <DialogDescription>
              {selectedCustomer
                ? `Yakin ingin menghapus customer "${selectedCustomer.customer_name}"?`
                : 'Yakin ingin menghapus customer ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteCustomerMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteCustomerMutation.isPending || !selectedCustomer}
            >
              {deleteCustomerMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCustomerDialog
        open={isEditDialogOpen}
        customer={selectedEditCustomer}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedEditCustomer(null);
            setUpdatingCustomerId(null);
          }
        }}
      />
    </Card>
  );
}
