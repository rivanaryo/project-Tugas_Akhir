import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Search, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { productService } from '../../../masterdata/items/services/productService';
import { warehouseService } from '../../../masterdata/warehouses/services/warehouseService';

interface StockBalanceFilterBarProps {
  q: string;
  warehouseId: string;
  productId: string;
  isLoading: boolean;
  onChangeQ: (value: string) => void;
  onChangeWarehouse: (value: string) => void;
  onChangeProduct: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

function ReferenceFilter({ kind, value, onChange }: { kind: 'product' | 'warehouse'; value: string; onChange: (value: string) => void }) {
  const title = kind === 'product' ? 'Produk' : 'Gudang';
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ id: string; name: string }>();
  const [search] = useDebounce(q, 300);
  const query = useQuery({
    queryKey: ['inventory', 'stock-balance-reference', kind, search, page],
    enabled: open,
    queryFn: async () => {
      if (kind === 'product') {
        const data = await productService.fetchProducts(page, 10, { q: search });
        return { options: data.items.map((item) => ({ id: String(item.id), name: item.product_name })), meta: data.meta };
      }
      const data = await warehouseService.fetchWarehouses(page, 10, { q: search });
      return { options: data.items.map((item) => ({ id: String(item.id), name: `${item.name}${item.code ? ` (${item.code})` : ''}` })), meta: data.meta };
    },
  });
  return <div className="space-y-2">
    <p className="text-sm font-medium text-text-h">{title}</p>
    <div className="flex min-w-0 gap-1">
      <Button type="button" variant="secondary" className="h-11 min-w-0 flex-1 justify-between font-normal" aria-label={`Pilih ${title}`} onClick={() => { setQ(''); setPage(1); setOpen(true); }}>
        <span className="truncate">{value ? selected?.id === value ? selected.name : value : `Semua ${title}`}</span><Search className="h-4 w-4 shrink-0" />
      </Button>
      {value && <Button type="button" variant="ghost" className="h-11 w-9 shrink-0 p-0" aria-label={`Hapus filter ${title}`} onClick={() => onChange('')}><X className="h-4 w-4" /></Button>}
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Pilih {title}</DialogTitle><DialogDescription>Cari dan pilih {title.toLowerCase()} untuk memfilter saldo stok.</DialogDescription></DialogHeader>
        <Input autoFocus className="mt-4" aria-label={`Cari ${title}`} placeholder={`Cari ${title.toLowerCase()}...`} value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} />
        <div className="my-4 divide-y divide-border rounded-xl border border-border">
          {query.isPending ? <p className="p-4 text-sm text-text">Memuat...</p> : query.isError ? <div role="alert" className="p-4 text-sm text-rose-400">Gagal memuat data. <Button type="button" size="sm" variant="secondary" onClick={() => void query.refetch()}>Coba lagi</Button></div> : !query.data.options.length ? <p className="p-4 text-sm text-text">Tidak ada data ditemukan.</p> : query.data.options.map((option) => <button type="button" key={option.id} className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm text-text-h hover:bg-surface-2" onClick={() => { setSelected(option); onChange(option.id); setOpen(false); }}><span>{option.name}</span><span className="shrink-0 font-semibold text-accent">{option.id === value ? 'Terpilih' : 'Pilih'}</span></button>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text"><span>Halaman {page} / {query.data?.meta.lastPage ?? 1}</span><div className="flex gap-2"><Button type="button" variant="secondary" size="sm" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</Button><Button type="button" variant="secondary" size="sm" disabled={!query.data || (!query.data.meta.hasNextPage && page >= query.data.meta.lastPage) || query.isFetching} onClick={() => setPage(page + 1)}>Selanjutnya</Button></div></div>
      </DialogContent>
    </Dialog>
  </div>;
}

export function StockBalanceFilterBar({ q, warehouseId, productId, isLoading, onChangeQ, onChangeWarehouse, onChangeProduct, onFilter, onReset }: StockBalanceFilterBarProps) {
  return <form className="rounded-2xl border border-border/70 bg-surface-2/40 p-4" onSubmit={(event) => { event.preventDefault(); onFilter(); }}>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
      <div className="grid w-full items-end gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="sb-search">Pencarian</Label><Input id="sb-search" className="h-11" placeholder="Produk, gudang, kode gudang / unit..." value={q} onChange={(event) => onChangeQ(event.target.value)} /></div>
        <ReferenceFilter kind="warehouse" value={warehouseId} onChange={onChangeWarehouse} />
        <ReferenceFilter kind="product" value={productId} onChange={onChangeProduct} />
      </div>
      <div className="flex shrink-0 justify-end gap-2"><Button type="button" variant="secondary" onClick={onReset}>Reset</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Memuat...' : 'Terapkan Filter'}</Button></div>
    </div>
  </form>;
}
