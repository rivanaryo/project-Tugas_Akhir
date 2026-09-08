import { Link } from 'react-router-dom';
import { ArrowRight, Package, ClipboardList, BarChart3 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-h">Inventory</h1>
        <p className="text-text">Kelola manajemen inventory dan stok.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/inventory/stock-movements" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Stock Movement</CardTitle>
              <CardDescription>
                Kelola pergerakan stok masuk dan keluar dengan referensi dari Sales Order dan Purchase Order.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/inventory/stock-opname" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <ClipboardList className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Stock Opname</CardTitle>
              <CardDescription>
                Lakukan stock opname untuk mencocokkan stok fisik dengan stok sistem.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/inventory/prediction" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Reports</CardTitle>
              <CardDescription>
                Lihat laporan inventory dan analisis pergerakan stok.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
