"use no memo";

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { SearchBar } from '../../../../components/ui/searchbar';
import { StockMovementTable } from '../components/StockMovementTable';
import { useStockMovements } from '../hooks/useStockMovements';
import { stockMovementService } from '../services/stockMovement.service';
import type { StockMovement } from '../types/stockMovement.types';

export function StockMovementsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [selectedStockMovement, setSelectedStockMovement] = useState<StockMovement | null>(null);
  const [deletingStockMovementId, setDeletingStockMovementId] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useStockMovements({ page, perPage: 15, filters: { q } });
  const stockMovements = data?.items ?? [];
  const meta = data?.meta;

  const handleSearch = (value: string) => { setQ(value); setPage(1); };
  const handleConfirmDelete = async () => {
    if (!selectedStockMovement) return;
    setDeletingStockMovementId(String(selectedStockMovement.id));
    try {
      await stockMovementService.deleteStockMovement(selectedStockMovement.id);
      toast.success('Stock Movement deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
      setSelectedStockMovement(null);
    } catch {
      toast.error('Failed to delete Stock Movement');
    } finally {
      setDeletingStockMovementId(null);
    }
  };

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Stock Movements</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1"><CardTitle>Stock Movements</CardTitle><CardDescription>Kelola pergerakan stok masuk dan keluar.</CardDescription></div>
          <Button asChild type="button" size="sm" className="gap-1.5"><Link to="/inventory/stock-movements/create"><Plus className="h-4 w-4" />Tambah</Link></Button>
        </div>
      </CardHeader>
      <CardContent><div className="space-y-4">
        <div className="max-w-md"><SearchBar value={q} onChange={handleSearch} onReset={() => handleSearch('')} placeholder="Search by reference number..." /></div>
        <StockMovementTable data={stockMovements} isLoading={isLoading} isError={isError} rowStartNumber={meta?.from ?? 1} onDeleteStockMovement={setSelectedStockMovement} deletingStockMovementId={deletingStockMovementId} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text">{meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} stock movements` : 'Menampilkan 0 stock movements'}</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={!canGoPrev}>Sebelumnya</Button>
            <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => meta && setPage(Math.min(meta.lastPage, page + 1))} disabled={!canGoNext}>Selanjutnya</Button>
          </div>
        </div>
      </div></CardContent>
      <Dialog open={Boolean(selectedStockMovement)} onOpenChange={(open) => { if (!open) setSelectedStockMovement(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Hapus Stock Movement</DialogTitle><DialogDescription>{selectedStockMovement ? `Yakin ingin menghapus stock movement "${selectedStockMovement.reference_number}"?` : 'Yakin ingin menghapus stock movement ini?'}</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button type="button" variant="secondary" disabled={Boolean(deletingStockMovementId)}>Batal</Button></DialogClose><Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={Boolean(deletingStockMovementId) || !selectedStockMovement}>{deletingStockMovementId ? 'Menghapus...' : 'Hapus'}</Button></DialogFooter></DialogContent>
      </Dialog>
    </Card>
  );
}
