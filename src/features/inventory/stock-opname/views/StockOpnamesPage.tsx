"use no memo";

import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { SearchBar } from '../../../../components/ui/searchbar';
import { Select } from '../../../../components/ui/select';
import { Label } from '../../../../components/ui/label';
import { StockOpnameTable } from '../components/StockOpnameTable';
import { useStockOpnames } from '../hooks/useStockOpnames';
import { stockOpnameService } from '../services/stockOpname.service';
import { useWarehouses } from '../../../masterdata/warehouses/hooks/useWarehouses';
import type { StockOpname } from '../types/stockOpname.types';

const statusOptions = [{ value: '', label: 'Semua Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Completed', label: 'Completed' }, { value: 'Cancelled', label: 'Cancelled' }];

export function StockOpnamesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [selectedStockOpname, setSelectedStockOpname] = useState<StockOpname | null>(null);
  const [deletingStockOpnameId, setDeletingStockOpnameId] = useState<string | null>(null);
  const { data: warehousesData, isLoading: isWarehousesLoading } = useWarehouses({ page: 1, perPage: 100 });
  const warehouses = warehousesData?.items ?? [];
  const { data, isLoading, isError, isFetching } = useStockOpnames({ page, perPage: 15, filters: { q, status, warehouse_id: warehouseId } });
  const stockOpnames = data?.items ?? [];
  const meta = data?.meta;
  const handleSearch = (value: string) => { setQ(value); setPage(1); };
  const handleConfirmDelete = async () => {
    if (!selectedStockOpname) return;
    setDeletingStockOpnameId(String(selectedStockOpname.id));
    try {
      await stockOpnameService.deleteStockOpname(selectedStockOpname.id);
      toast.success('Stock Opname deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setSelectedStockOpname(null);
    } catch { toast.error('Failed to delete Stock Opname'); } finally { setDeletingStockOpnameId(null); }
  };
  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Stock Opname</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-1"><CardTitle>Stock Opname</CardTitle><CardDescription>Kelola stock opname untuk mencocokkan stok fisik dengan sistem.</CardDescription></div><Button asChild type="button" size="sm" className="gap-1.5"><Link to="/inventory/stock-opnames/create"><Plus className="h-4 w-4" />Tambah</Link></Button></div>
      </CardHeader>
      <CardContent><div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full max-w-md"><SearchBar value={q} onChange={handleSearch} onReset={() => handleSearch('')} placeholder="Cari opname number, notes, atau gudang..." /></div>
          <div className="w-full max-w-xs space-y-1.5"><Label htmlFor="status" className="text-xs font-medium">Status</Label><Select id="status" value={status} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setStatus(e.target.value); setPage(1); }}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></div>
          <div className="w-full max-w-xs space-y-1.5"><Label htmlFor="warehouse" className="text-xs font-medium">Gudang</Label><Select id="warehouse" value={warehouseId} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setWarehouseId(e.target.value); setPage(1); }} disabled={isWarehousesLoading}><option value="">Semua Gudang</option>{warehouses.map((w) => <option key={String(w.id)} value={String(w.id)}>{w.name}</option>)}</Select></div>
        </div>
        <StockOpnameTable data={stockOpnames} isLoading={isLoading} isError={isError} rowStartNumber={meta?.from ?? 1} onDeleteStockOpname={setSelectedStockOpname} deletingStockOpnameId={deletingStockOpnameId} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-text">{meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} stock opnames` : 'Menampilkan 0 stock opnames'}</p><div className="flex items-center gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={!canGoPrev}>Sebelumnya</Button><span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}</span><Button type="button" variant="secondary" size="sm" onClick={() => meta && setPage(Math.min(meta.lastPage, page + 1))} disabled={!canGoNext}>Selanjutnya</Button></div></div>
      </div></CardContent>
      <Dialog open={Boolean(selectedStockOpname)} onOpenChange={(open) => { if (!open) setSelectedStockOpname(null); }}><DialogContent><DialogHeader><DialogTitle>Hapus Stock Opname</DialogTitle><DialogDescription>{selectedStockOpname ? `Yakin ingin menghapus stock opname "${selectedStockOpname.opname_number}"?` : 'Yakin ingin menghapus stock opname ini?'}</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button type="button" variant="secondary" disabled={Boolean(deletingStockOpnameId)}>Batal</Button></DialogClose><Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={Boolean(deletingStockOpnameId) || !selectedStockOpname}>{deletingStockOpnameId ? 'Menghapus...' : 'Hapus'}</Button></DialogFooter></DialogContent></Dialog>
    </Card>
  );
}
