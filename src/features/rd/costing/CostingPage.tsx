import { useQueries, useQuery } from '@tanstack/react-query';
import { Calculator, Package } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { techPackService } from '../tech-pack/techPack.service';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export function CostingPage() {
  const listQuery = useQuery({ queryKey: ['rd', 'tech-packs'], queryFn: techPackService.list });
  const detailQueries = useQueries({
    queries: (listQuery.data ?? []).map((pack) => ({
      queryKey: ['rd', 'tech-packs', pack.id],
      queryFn: () => techPackService.detail(pack.id),
      staleTime: 30_000,
    })),
  });
  const techPacks = detailQueries.flatMap((query) => query.data ? [query.data] : []);
  const isLoading = listQuery.isLoading || detailQueries.some((query) => query.isLoading);
  const isError = listQuery.isError || detailQueries.some((query) => query.isError);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div><CardTitle className="text-2xl">Costing & BOM</CardTitle><CardDescription>Kalkulasi HPP dan pemakaian bahan per produk berdasarkan Tech Pack.</CardDescription></div>
            <Badge variant="default">R&D Module</Badge>
          </div>
        </CardHeader>
      </Card>

      {isLoading && <p className="text-sm text-text">Memuat costing dan BOM...</p>}
      {isError && <p className="text-sm text-rose-400">Costing dan BOM gagal dimuat.</p>}
      {!isLoading && !isError && techPacks.length === 0 && <p className="text-sm text-text">Belum ada data costing.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {techPacks.filter((pack) => pack.costing).map((pack) => {
          const costing = pack.costing!;
          return (
            <Card key={pack.id}>
              <CardHeader className="pb-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Calculator className="h-5 w-5" /></div><CardTitle className="text-lg">{pack.name}</CardTitle></div></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Material Cost" value={costing.material_cost} />
                <Row label="Printing / Bordir" value={costing.printing_cost} />
                <Row label="Ongkos Jahit" value={costing.sewing_cost} />
                <Row label="Biaya Tambahan" value={costing.additional_cost} />
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span className="text-text-h">HPP</span><span className="text-text-h">{formatCurrency(Number(costing.hpp))}</span></div>
                <div className="flex justify-between"><span className="text-text">Margin</span><span className="font-medium text-emerald-400">{costing.margin_type === 'percentage' ? `${costing.margin}%` : formatCurrency(Number(costing.margin))}</span></div>
                <div className="flex justify-between text-lg font-bold"><span className="text-text-h">Harga Jual</span><span className="text-accent">{formatCurrency(Number(costing.sell_price))}</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Bill of Materials (BOM)</CardTitle><CardDescription>Detail pemakaian bahan per Tech Pack.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Pemakaian</th><th className="px-4 py-3">Satuan</th><th className="px-4 py-3 text-right">Harga / Unit</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-border bg-surface-1">{techPacks.flatMap((pack) => (pack.bom_items ?? []).map((item) => <tr key={`${pack.id}-${item.id}`}><td className="px-4 py-3 font-medium text-text-h">{pack.name}</td><td className="px-4 py-3 text-text">{item.material?.product_name ?? item.material_product_id}</td><td className="px-4 py-3 text-text">{item.usage}</td><td className="px-4 py-3 text-text">{item.unit?.unit_name ?? item.unit?.unit_code ?? '-'}</td><td className="px-4 py-3 text-right text-text">{formatCurrency(Number(item.cost_per_unit))}</td><td className="px-4 py-3 text-right font-medium text-text-h">{formatCurrency(Number(item.total))}</td></tr>))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between"><span className="text-text">{label}</span><span className="font-medium text-text-h">{formatCurrency(Number(value))}</span></div>;
}
