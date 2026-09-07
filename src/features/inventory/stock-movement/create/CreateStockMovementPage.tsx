import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { StockMovementCreateForm } from './components/StockMovementCreateForm';

export function CreateStockMovementPage() {
  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/stock-movements">Stock Movements</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Tambah</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <CardTitle>Tambah Stock Movement</CardTitle>
        <CardDescription>Buat stock movement baru untuk mencatat pergerakan stok.</CardDescription>
      </CardHeader>
      <CardContent><StockMovementCreateForm /></CardContent>
    </Card>
  );
}
