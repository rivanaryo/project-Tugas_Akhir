import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { StockOpnameCreateForm } from './components/StockOpnameCreateForm';

export function CreateStockOpnamePage() {
  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/stock-opname">Stock Opname</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Tambah</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <CardTitle>Tambah Stock Opname</CardTitle>
        <CardDescription>Buat stock opname baru untuk mencocokkan stok fisik dengan sistem.</CardDescription>
      </CardHeader>
      <CardContent><StockOpnameCreateForm /></CardContent>
    </Card>
  );
}
