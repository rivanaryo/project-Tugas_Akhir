import { Link } from 'react-router-dom';
import { ArrowRight, Package, ClipboardList, BarChart3, ShoppingCart, Truck } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-h">Inventory & Procurement</h1>
        <p className="text-text">Kelola purchase order, penerimaan barang, pergerakan stok, opname, dan prediksi ROP.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/inventory/purchase-orders" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Purchase Orders</CardTitle>
              <CardDescription>Kelola dan pantau purchase order.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/inventory/good-receipts" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Good Receipts</CardTitle>
              <CardDescription>Catat penerimaan barang dari vendor.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/inventory/stock-movements" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Stock Movements</CardTitle>
              <CardDescription>Kelola pergerakan stok masuk dan keluar.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/inventory/stock-opnames" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <ClipboardList className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">Stock Opname</CardTitle>
              <CardDescription>Lakukan stock opname untuk mencocokkan stok fisik dengan stok sistem.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/inventory/rop-prediction" className="group">
          <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-accent/10 p-3">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-text transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">ROP Prediction</CardTitle>
              <CardDescription>Lihat hasil prediksi reorder point.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
