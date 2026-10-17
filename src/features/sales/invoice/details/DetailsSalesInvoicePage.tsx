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
import { SalesInvoiceItemsTable } from '../components/SalesInvoiceItemsTable';
import { useDeleteSalesInvoice } from '../hooks/useDeleteSalesInvoices';
import { useSalesInvoice } from '../hooks/useSalesInvoice';
import { useSalesInvoiceItems } from '../hooks/useSalesInvoiceItems';

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

export function DetailsSalesInvoicePage() {
  const params = useParams();
  const invoiceId = params.invoiceId ?? params.id;
  const navigate = useNavigate();
  const deleteMutation = useDeleteSalesInvoice();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Ambil Data Head Invoice
  const { data: invoice, isLoading: isHeadLoading, isError: isHeadError } = useSalesInvoice(invoiceId);
  
  // Ambil Data Items Invoice (Ambil langsung 100 item tanpa pagination URL)
  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isError: isItemsError,
    isFetching: isItemsFetching,
  } = useSalesInvoiceItems({
    invoiceId,
    page: 1,
    perPage: 100, 
  });

  // Proteksi data items agar tidak melempar instansiasi array baru jika data kosong
  const items = useMemo(() => itemsData?.items ?? [], [itemsData?.items]);

  // Kalkulasi Total Value yang aman dari looping referensi objek
  const totalValue = useMemo(() => {
    return items.reduce((total, item) => {
      const explicitTotalNumber = item.total_price !== null && item.total_price !== undefined ? Number(item.total_price) : NaN;
      if (Number.isFinite(explicitTotalNumber)) return total + explicitTotalNumber;

      const qty = Number(item.qty_invoice ?? 0);
      const unitPrice = item.unit_price !== null && item.unit_price !== undefined ? Number(item.unit_price) : NaN;
      const taxAmount = item.tax_amount !== null && item.tax_amount !== undefined ? Number(item.tax_amount) : 0;
      if (!Number.isFinite(qty) || !Number.isFinite(unitPrice)) return total;
      return total + qty * unitPrice + (Number.isFinite(taxAmount) ? taxAmount : 0);
    }, 0);
  }, [items]);

  const handleConfirmDelete = async () => {
    if (!invoice) return;
    try {
      const result = await deleteMutation.mutateAsync(invoice.id);
      toast.success(result.message);
      navigate('/sales/sales-invoices');
    } catch {
      toast.error('Gagal menghapus Sales Invoice');
    }
  };

  const statusBadge = useMemo(() => {
    const status = invoice?.status;
    if (status === true || status === 'completed') return <Badge variant="success">Completed</Badge>;
    if (status === 'approved') return <Badge variant="default">Approved</Badge>;
    if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  }, [invoice?.status]);

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
              <BreadcrumbLink asChild>
                <Link to="/sales/sales-invoices">Sales Invoices</Link>
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
            <CardTitle>Sales Invoice Details</CardTitle>
            <CardDescription>Detail Sales Invoice (read only)</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {invoice && (
              <Button asChild type="button" variant="secondary" size="sm" className="h-9 w-9 p-0">
                <Link to={`/sales/sales-invoices/${invoice.id}/edit`} aria-label="Edit sales invoice">
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
              disabled={!invoice || deleteMutation.isPending}
              aria-label="Delete sales invoice"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isHeadError ? (
          <p className="text-sm text-rose-400">Gagal memuat data sales invoice.</p>
        ) : isHeadLoading || !invoice ? (
          <p className="text-sm text-muted-foreground">Loading sales invoice...</p>
        ) : (
          <>
            {/* Bagian Informasi Head */}
            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-h">Head</p>
                  <p className="text-sm text-text">Informasi utama Sales Invoice</p>
                </div>
                {statusBadge}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-text">Invoice Number</p>
                  <p className="text-sm font-semibold text-text-h">{invoice.invoice_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Invoice Date</p>
                  <p className="text-sm font-semibold text-text-h">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Customer</p>
                  <p className="text-sm font-semibold text-text-h">{invoice.customer?.customer_name ?? String(invoice.customer_id ?? '-')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Grand Total</p>
                  <p className="text-sm font-semibold text-text-h">{formatMoney(invoice.grand_total)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Subtotal</p>
                  <p className="text-sm font-semibold text-text-h">{formatMoney(invoice.subtotal)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text">Tax Total</p>
                  <p className="text-sm font-semibold text-text-h">{formatMoney(invoice.tax_total)}</p>
                </div>
              </div>
            </section>

            {/* Bagian Tabel Item */}
            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-h">Sales Invoice Items</p>
                  <p className="text-sm text-text">Daftar item pada Sales Invoice</p>
                </div>
                <p className="text-xs text-text">
                  {isItemsFetching ? 'Memuat...' : itemsData?.meta ? `Total ${itemsData.meta.total} item` : ''}
                </p>
              </div>

              <SalesInvoiceItemsTable
                data={items}
                isLoading={isItemsLoading}
                isError={isItemsError}
                rowStartNumber={itemsData?.meta?.from ?? 1}
              />
            </section>

            {/* Bagian Ringkasan Total */}
            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-h">Total</p>
                  <p className="text-sm text-text">Total value</p>
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

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Sales Invoice</DialogTitle>
            <DialogDescription>
              {invoice ? `Yakin ingin menghapus sales invoice "${invoice.invoice_number}"?` : 'Yakin ingin menghapus sales invoice ini?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Batal</Button>
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