import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { GoodReceiptsFilterBar } from '../components/GoodReceiptsFilterBar';
import { GoodReceiptsTable } from '../components/GoodReceiptsTable';
import { useDeleteGoodReceipt } from '../hooks/useDeleteGoodReceipt';
import { useGoodReceiptFilters } from '../hooks/useGoodReceiptFilters';
import { useGoodReceipts } from '../hooks/useGoodReceipts';
import { useWarehouses } from '../../../masterdata/warehouses/hooks/useWarehouses';
import type { GoodReceiptHead } from '../types/goodReceipt.types';

export function GoodReceiptsTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useGoodReceiptFilters();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoodReceipt, setSelectedGoodReceipt] = useState<GoodReceiptHead | null>(null);
  const [deletingGoodReceiptId, setDeletingGoodReceiptId] = useState<string | number | null>(null);
  const deleteGoodReceiptMutation = useDeleteGoodReceipt();

  const { data, isLoading, isError, isFetching } = useGoodReceipts({ page, perPage, filters: queryFilters });
  const { data: warehousesData, isLoading: isWarehousesLoading } = useWarehouses({ page: 1, perPage: 100 });
  const warehouses = warehousesData?.items ?? [];
  const goodReceipts = data?.items ?? [];
  const meta = data?.meta;

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  const handleDeleteGoodReceipt = (goodReceipt: GoodReceiptHead) => {
    setSelectedGoodReceipt(goodReceipt);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGoodReceipt) return;
    try {
      setDeletingGoodReceiptId(selectedGoodReceipt.id);
      const result = await deleteGoodReceiptMutation.mutateAsync(selectedGoodReceipt.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedGoodReceipt(null);
    } catch {
      toast.error('Gagal menghapus Good Receipt');
    } finally {
      setDeletingGoodReceiptId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/purchase-orders">Purchase</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Good Receipts</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Good Receipts</CardTitle>
            <CardDescription>Kelola data Good Receipt</CardDescription>
          </div>
          <Button asChild type="button" size="sm" className="gap-1.5">
            <Link to="/inventory/good-receipts/create"><Plus className="h-4 w-4" />Tambah</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <GoodReceiptsFilterBar q={uiFilters.q} status={uiFilters.status} warehouse_id={uiFilters.warehouse_id} warehouses={warehouses} isWarehousesLoading={isWarehousesLoading} receipt_date_from={uiFilters.receipt_date_from} receipt_date_to={uiFilters.receipt_date_to} onChange={updateFilters} onReset={resetFilters} isLoading={isLoading || isFetching} />

          <GoodReceiptsTable data={goodReceipts} isLoading={isLoading} isError={isError} rowStartNumber={meta?.from ?? 1} onDeleteGoodReceipt={handleDeleteGoodReceipt} deletingGoodReceiptId={deletingGoodReceiptId} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">{meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} good receipts` : 'Menampilkan 0 good receipts'}</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={!canGoPrev}>Sebelumnya</Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}</span>
              <Button type="button" variant="secondary" size="sm" onClick={() => meta && setPage(Math.min(meta.lastPage, page + 1))} disabled={!canGoNext}>Selanjutnya</Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setSelectedGoodReceipt(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Good Receipt</DialogTitle>
            <DialogDescription>{selectedGoodReceipt ? `Yakin ingin menghapus good receipt "${selectedGoodReceipt.gr_number}"?` : 'Yakin ingin menghapus good receipt ini?'}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary" disabled={deleteGoodReceiptMutation.isPending}>Batal</Button></DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={deleteGoodReceiptMutation.isPending || !selectedGoodReceipt}>{deleteGoodReceiptMutation.isPending ? 'Menghapus...' : 'Hapus'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
