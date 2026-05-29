import { useEffect, useRef, useState } from 'react';
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
import { SalesInvoiceTable } from '../components/SalesInvoiceTable';
import { SalesInvoiceFilterBar } from '../components/SalesInvoiceFilterBar';
import { useDeleteSalesInvoice } from '../hooks/useDeleteSalesInvoices';
import { useSalesInvoiceFilters } from '../hooks/useSalesInvoiceFilters';
import { useSalesInvoices } from '../hooks/useSalesInvoices';
import type { SalesInvoiceHead } from '../types/salesInvoices';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';

export function SalesInvoicesTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useSalesInvoiceFilters();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSalesInvoice, setSelectedSalesInvoice] = useState<SalesInvoiceHead | null>(null);
  const [deletingSalesInvoiceId, setDeletingSalesInvoiceId] = useState<string | number | null>(null);
  const [localSearch, setLocalSearch] = useState(uiFilters.q || '');
  const debouncedSearch = useDebouncedValue(localSearch, 500);
  const deleteSalesInvoiceMutation = useDeleteSalesInvoice();

  const { data, isLoading, isError, isFetching } = useSalesInvoices({ page, perPage, filters: queryFilters });
  const salesInvoices = data?.items ?? [];
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

  const handleDeleteSalesInvoice = (salesInvoice: SalesInvoiceHead) => {
    setSelectedSalesInvoice(salesInvoice);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSalesInvoice) return;

    try {
      setDeletingSalesInvoiceId(selectedSalesInvoice.id);
      const result = await deleteSalesInvoiceMutation.mutateAsync(selectedSalesInvoice.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedSalesInvoice(null);
    } catch {
      toast.error('Gagal menghapus Sales Invoice');
    } finally {
      setDeletingSalesInvoiceId(null);
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
              <BreadcrumbPage>Sales Invoices</BreadcrumbPage> 
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Sales Invoices</CardTitle>
            <CardDescription>Kelola data Sales Invoice</CardDescription>
          </div>

          <Button asChild type="button" size="sm" className="gap-1.5">
            <Link to="/sales/sales-invoices/create">
              <Plus className="h-4 w-4" />
              Tambah
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <SalesInvoiceFilterBar
            q={localSearch}
            status={uiFilters.status}
            invoice_date_from={uiFilters.invoice_date_from}
            invoice_date_to={uiFilters.invoice_date_to}
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

          <SalesInvoiceTable
            data={salesInvoices}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onDeleteSalesInvoice={handleDeleteSalesInvoice}
            deletingSalesInvoiceId={deletingSalesInvoiceId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} sales invoices` : 'Menampilkan 0 sales invoices'}
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
            setSelectedSalesInvoice(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sales Invoice</DialogTitle>
            <DialogDescription>
              {selectedSalesInvoice
                ? `Yakin ingin menghapus sales invoice "${selectedSalesInvoice.invoice_number}"?`
                : 'Yakin ingin menghapus sales invoice ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteSalesInvoiceMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSalesInvoiceMutation.isPending || !selectedSalesInvoice}
            >
              {deleteSalesInvoiceMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
