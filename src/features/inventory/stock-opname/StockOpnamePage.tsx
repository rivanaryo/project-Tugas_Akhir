import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export function StockOpnamePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-h">Stock Opname</h1>
        <p className="text-text">Lakukan stock opname untuk mencocokkan stok fisik dengan stok sistem.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Fitur Stock Opname sedang dalam pengembangan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text">Fitur ini akan segera tersedia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
