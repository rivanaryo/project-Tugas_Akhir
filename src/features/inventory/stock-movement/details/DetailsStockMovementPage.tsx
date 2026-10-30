"use no memo";

import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { stockMovementService } from '../services/stockMovement.service';

const formatDate = (value: string) => !value ? '-' : value.includes('T') ? value.slice(0, 10) : value;

export function DetailsStockMovementPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stockMovement, isLoading, isError } = useQuery({ queryKey: ['inventory', 'stock-movements', id], queryFn: () => stockMovementService.fetchStockMovement(id!), enabled: !!id });
  if (isLoading) return <div className="p-8 text-center">Loading stock movement details...</div>;
  if (isError || !stockMovement) return <div className="p-8 text-center text-rose-400">Failed to load stock movement details.</div>;
  const metadata = [
    ['Reference Number', stockMovement.reference_number],
    ['Product', stockMovement.product?.product_name ?? stockMovement.product?.name ?? stockMovement.product_name ?? stockMovement.m_products_id ?? stockMovement.product_id ?? '-'],
    ['Warehouse', stockMovement.warehouse?.warehouse_name ?? stockMovement.warehouse?.name ?? stockMovement.warehouse_name ?? stockMovement.m_warehouses_id ?? stockMovement.warehouse_id ?? '-'],
    ['Quantity', stockMovement.quantity],
    ['Unit', stockMovement.product?.unit ?? '-'],
    ['Stok Sebelum', stockMovement.stock_before ?? '-'],
    ['Stok Sesudah', stockMovement.stock_after ?? '-'],
    ['Movement Date', formatDate(stockMovement.date ?? stockMovement.created_at ?? '')],
    ['Reference', stockMovement.referenceable_type ?? stockMovement.document_type ?? stockMovement.reference ?? '-'],
    ['Created At', formatDate(stockMovement.created_at ?? '')],
    ['Updated At', formatDate(stockMovement.updated_at ?? '')],
    ['Description', stockMovement.description ?? '-'],
  ];
  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/stock-movements">Stock Movements</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Detail {stockMovement.reference_number}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-1"><CardTitle>Stock Movement Detail</CardTitle><CardDescription>Informasi lengkap mengenai Stock Movement #{stockMovement.reference_number}</CardDescription></div><div className="flex items-center gap-2">{stockMovement.type === 'in' ? <Badge variant="success">In (Masuk)</Badge> : <Badge variant="danger">Out (Keluar)</Badge>}<Button asChild variant="secondary" size="sm"><Link to={`/inventory/stock-movements/${stockMovement.id}/edit`}><Edit className="mr-1.5 h-4 w-4" />Edit</Link></Button></div></div>
      </CardHeader>
      <CardContent><section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{metadata.map(([label, value], index) => <div key={String(label)} className={index === metadata.length - 1 ? 'md:col-span-2 lg:col-span-3 space-y-1' : 'space-y-1'}><p className="text-xs font-medium uppercase tracking-wider text-text/60">{label}</p><p className="text-sm font-semibold text-text-h">{String(value)}</p></div>)}</section></CardContent>
    </Card>
  );
}
