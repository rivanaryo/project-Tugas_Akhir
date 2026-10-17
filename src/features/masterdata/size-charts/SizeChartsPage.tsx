import { Package, Plus } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

interface SizeChart {
  id: string;
  product: string;
  size: string;
  chestWidth: number;
  bodyLength: number;
  sleeveLength: number;
  shoulderWidth: number;
}

const sizeCharts: SizeChart[] = [
  { id: '1', product: 'Hoodie Fleece Custom', size: 'S', chestWidth: 50, bodyLength: 65, sleeveLength: 58, shoulderWidth: 45 },
  { id: '2', product: 'Hoodie Fleece Custom', size: 'M', chestWidth: 53, bodyLength: 68, sleeveLength: 60, shoulderWidth: 47 },
  { id: '3', product: 'Hoodie Fleece Custom', size: 'L', chestWidth: 56, bodyLength: 71, sleeveLength: 62, shoulderWidth: 49 },
  { id: '4', product: 'Hoodie Fleece Custom', size: 'XL', chestWidth: 59, bodyLength: 74, sleeveLength: 64, shoulderWidth: 51 },
  { id: '5', product: 'Hoodie Fleece Custom', size: 'XXL', chestWidth: 62, bodyLength: 77, sleeveLength: 66, shoulderWidth: 53 },
  { id: '6', product: 'Polo Shirt Cotton Pique', size: 'S', chestWidth: 48, bodyLength: 66, sleeveLength: 21, shoulderWidth: 43 },
  { id: '7', product: 'Polo Shirt Cotton Pique', size: 'M', chestWidth: 51, bodyLength: 69, sleeveLength: 22, shoulderWidth: 45 },
  { id: '8', product: 'Polo Shirt Cotton Pique', size: 'L', chestWidth: 54, bodyLength: 72, sleeveLength: 23, shoulderWidth: 47 },
  { id: '9', product: 'Polo Shirt Cotton Pique', size: 'XL', chestWidth: 57, bodyLength: 75, sleeveLength: 24, shoulderWidth: 49 },
  { id: '10', product: 'Polo Shirt Cotton Pique', size: 'XXL', chestWidth: 60, bodyLength: 78, sleeveLength: 25, shoulderWidth: 51 },
];

const grouped = sizeCharts.reduce((acc, row) => {
  if (!acc[row.product]) acc[row.product] = [];
  acc[row.product].push(row);
  return acc;
}, {} as Record<string, SizeChart[]>);

export function SizeChartsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Size Charts & Specs</CardTitle>
              <CardDescription>
                Standar ukuran S, M, L, XL, XXL untuk produk konveksi.
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Tambah Size Chart
            </Button>
          </div>
        </CardHeader>
      </Card>

      {Object.entries(grouped).map(([product, rows]) => (
        <Card key={product}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Package className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{product}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Size</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Lebar Dada</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Panjang Baju</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Panjang Lengan</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Lebar Bahu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface-1">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-semibold text-text-h">
                        <Badge variant="secondary">{row.size}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text">{row.chestWidth} cm</td>
                      <td className="px-4 py-3 text-text">{row.bodyLength} cm</td>
                      <td className="px-4 py-3 text-text">{row.sleeveLength} cm</td>
                      <td className="px-4 py-3 text-text">{row.shoulderWidth} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
