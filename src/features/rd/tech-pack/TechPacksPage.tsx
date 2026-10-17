import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileSpreadsheet, FileText, Layers, Package, Plus, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { techPackService } from './techPack.service';
import type { TechPack, TechPackStatus } from './techPack.types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const statusConfig: Record<TechPackStatus, { label: string; variant: 'secondary' | 'warning' | 'success' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  review: { label: 'In Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
};

export function TechPacksPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listQuery = useQuery({ queryKey: ['rd', 'tech-packs'], queryFn: techPackService.list });
  const detailQuery = useQuery({
    queryKey: ['rd', 'tech-packs', selectedId],
    queryFn: () => techPackService.detail(selectedId as string),
    enabled: Boolean(selectedId),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TechPackStatus }) => techPackService.updateStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rd', 'tech-packs'] });
      toast.success('Status tech pack berhasil diperbarui');
    },
    onError: () => toast.error('Status tech pack gagal diperbarui'),
  });
  const techPacks = listQuery.data ?? [];
  const selectedPack = detailQuery.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Tech Pack & Specs</CardTitle>
              <CardDescription>Spesifikasi desain, BOM, size chart, dan breakdown HPP produk.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">R&D Module</Badge>
              <Button asChild size="sm"><Link to="/rd/tech-packs/create"><Plus className="h-4 w-4" />Create Tech Pack</Link></Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {listQuery.isLoading && <p className="text-sm text-text">Memuat tech pack...</p>}
      {listQuery.isError && <p className="text-sm text-rose-400">Tech pack gagal dimuat.</p>}
      {!listQuery.isLoading && !listQuery.isError && techPacks.length === 0 && <p className="text-sm text-text">Belum ada tech pack.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {techPacks.map((pack) => (
          <Card key={pack.id} className="group cursor-pointer transition-all hover:border-accent/50 hover:bg-surface-2/50" onClick={() => setSelectedId(pack.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><FileText className="h-6 w-6" /></div>
                <Badge variant={statusConfig[pack.status].variant}>{statusConfig[pack.status].label}</Badge>
              </div>
              <CardTitle className="mt-4 text-lg">{pack.name}</CardTitle>
              <CardDescription className="text-xs">{pack.product?.product_name ?? pack.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-text"><Package className="h-4 w-4 text-text/70" /><span>{pack.fabric || '-'}{pack.gsm ? ` • ${pack.gsm} GSM` : ''}</span></div>
              <div className="flex items-center gap-2 text-sm text-text"><Ruler className="h-4 w-4 text-text/70" /><span>{pack.bom_items_count ?? 0} Material BOM</span></div>
              <div className="flex items-center gap-2 text-sm text-text"><Layers className="h-4 w-4 text-text/70" /><span>HPP: {formatCurrency(Number(pack.costing?.hpp ?? 0))}</span></div>
              <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-accent">View Detail<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl">{selectedPack?.name ?? 'Memuat detail...'}</DialogTitle></DialogHeader>
          {detailQuery.isLoading && <p className="text-sm text-text">Memuat detail tech pack...</p>}
          {detailQuery.isError && <p className="text-sm text-rose-400">Detail tech pack gagal dimuat.</p>}
          {selectedPack && <TechPackDetail pack={selectedPack} onStatusChange={(status) => statusMutation.mutate({ id: selectedPack.id, status })} isUpdating={statusMutation.isPending} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TechPackDetail({ pack, onStatusChange, isUpdating }: { pack: TechPack; onStatusChange: (status: TechPackStatus) => void; isUpdating: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2"><Badge variant={statusConfig[pack.status].variant}>{statusConfig[pack.status].label}</Badge><span className="text-sm text-text">{pack.fabric || '-'}{pack.gsm ? ` • ${pack.gsm} GSM` : ''}</span></div>

      <section className="rounded-2xl border border-border bg-surface-2/30 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-text-h"><Package className="h-4 w-4 text-accent" />Bill of Materials</h4>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="px-3 py-2">Material</th><th className="px-3 py-2">Usage</th><th className="px-3 py-2">Harga/Unit</th><th className="px-3 py-2">Total</th></tr></thead><tbody className="divide-y divide-border">{(pack.bom_items ?? []).map((item) => <tr key={item.id}><td className="px-3 py-2">{item.material?.product_name ?? item.material_product_id}</td><td className="px-3 py-2">{item.usage} {item.unit?.unit_code ?? item.unit?.unit_name ?? ''}</td><td className="px-3 py-2">{formatCurrency(Number(item.cost_per_unit))}</td><td className="px-3 py-2 font-medium">{formatCurrency(Number(item.total))}</td></tr>)}</tbody></table>
        </div>
        {(pack.bom_items ?? []).length === 0 && <p className="mt-3 text-sm text-text">Belum ada material BOM.</p>}
      </section>

      <section className="rounded-2xl border border-border bg-surface-2/30 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-text-h"><Ruler className="h-4 w-4 text-accent" />Size Chart</h4>
        <div className="flex flex-wrap gap-2">{(pack.size_charts ?? []).map((row) => <Badge key={row.id ?? row.size} variant="secondary">{row.size}: {row.body_length ?? '-'} × {row.chest_width ?? '-'} cm</Badge>)}</div>
        {(pack.size_charts ?? []).length === 0 && <p className="text-sm text-text">Belum ada size chart.</p>}
      </section>

      <section className="rounded-2xl border border-border bg-surface-2/30 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-text-h"><FileSpreadsheet className="h-4 w-4 text-accent" />Costing</h4>
        {pack.costing ? <div className="grid gap-3 text-sm sm:grid-cols-2"><Cost label="Material" value={pack.costing.material_cost} /><Cost label="Printing/Bordir" value={pack.costing.printing_cost} /><Cost label="Jahit" value={pack.costing.sewing_cost} /><Cost label="Tambahan" value={pack.costing.additional_cost} /><Cost label="HPP" value={pack.costing.hpp} strong /><div><p className="text-text">Margin</p><p className="font-semibold text-text-h">{pack.costing.margin_type === 'percentage' ? `${pack.costing.margin}%` : formatCurrency(Number(pack.costing.margin))}</p></div><Cost label="Harga Jual" value={pack.costing.sell_price} strong /></div> : <p className="text-sm text-text">Belum ada costing.</p>}
      </section>

      <div className="flex justify-end gap-2">{pack.status === 'draft' && <Button variant="secondary" disabled={isUpdating} onClick={() => onStatusChange('review')}>Ajukan Review</Button>}<Button disabled={isUpdating || pack.status === 'approved'} onClick={() => onStatusChange('approved')}><CheckCircle2 className="h-4 w-4" />{pack.status === 'approved' ? 'Sudah Approved' : 'Approve'}</Button></div>
    </div>
  );
}

function Cost({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div><p className="text-text">{label}</p><p className={strong ? 'text-lg font-bold text-accent' : 'font-semibold text-text-h'}>{formatCurrency(Number(value))}</p></div>;
}
