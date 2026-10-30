import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Truck } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-h">Inventory & Procurement</h1>
        <p className="text-text">Kelola pergerakan stok, stock opname, purchase order, dan penerimaan barang.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { to: '/inventory/stock-balance', title: 'Stock Balance', description: 'Lihat total stok masuk, keluar, dan stok akhir per produk dan gudang.' },
          { to: '/inventory/stock-movements', title: 'Stock Movement', description: 'Pantau stok masuk, keluar, dan riwayat pergerakan barang.' },
          { to: '/inventory/stock-opnames', title: 'Stock Opname', description: 'Cocokkan stok fisik dengan sistem dan kelola selisih stok.' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group">
            <Card className="h-full transition-all hover:border-accent hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between"><Truck className="h-6 w-6 text-accent" /><ArrowRight className="h-5 w-5 text-text" /></div>
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
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
      </div>
    </div>
  );
}
