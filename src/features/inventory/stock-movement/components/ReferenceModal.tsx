"use no memo";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { SearchBar } from '../../../../components/ui/searchbar';
import { useStockOpnames } from '../../stock-opname/hooks/useStockOpnames';
import type { CreateReferenceableType } from '../types/stockMovement.types';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference: (id: string, type: CreateReferenceableType) => void;
}

export function ReferenceModal({ isOpen, onClose, onSelectReference }: ReferenceModalProps) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { data, isLoading, isError, isFetching } = useStockOpnames({ page, perPage: 10, filters: { q } });
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Pilih Referensi Stock Opname</DialogTitle>
          <DialogDescription>Pilih dokumen referensi yang valid. Opname Completed sudah membuat movement selisih otomatis; jangan buat penyesuaian yang sama dua kali.</DialogDescription>
        </DialogHeader>
        <SearchBar value={q} onChange={(value) => { setQ(value); setPage(1); }} onReset={() => { setQ(''); setPage(1); }} placeholder="Cari nomor opname..." />
        <div className="overflow-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2"><tr><th className="p-3">Nomor</th><th className="p-3">Gudang</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr></thead>
            <tbody>
              {isLoading || isError || !data?.items.length ? <tr><td colSpan={4} className="p-4 text-center">{isLoading ? 'Memuat...' : isError ? 'Gagal memuat referensi.' : 'Tidak ada stock opname.'}</td></tr> : data.items.map((item) => (
                <tr key={item.id} className="border-t border-border"><td className="p-3">{item.opname_number}</td><td className="p-3">{item.warehouse?.name ?? '-'}</td><td className="p-3">{item.status}</td><td className="p-3"><Button type="button" size="sm" onClick={() => { onSelectReference(item.id, 'Stock Opname'); onClose(); }}>Pilih</Button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="secondary" disabled={!data?.meta.hasPrevPage || isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <span className="text-sm">Halaman {data?.meta.currentPage ?? page} / {data?.meta.lastPage ?? 1}</span>
          <Button type="button" variant="secondary" disabled={!data?.meta.hasNextPage || isFetching} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
