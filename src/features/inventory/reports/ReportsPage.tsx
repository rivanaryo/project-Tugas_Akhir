import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-h">Inventory Reports</h1>
        <p className="text-text">Lihat laporan inventory dan analisis pergerakan stok.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Fitur Reports sedang dalam pengembangan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text">Fitur ini akan segera tersedia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
