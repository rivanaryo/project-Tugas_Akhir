"use no memo";

import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { stockOpnameService } from '../services/stockOpname.service';
import type { StockOpnameItem } from '../types/stockOpname.types';

const formatDate = (value: string) => !value ? '-' : value.includes('T') ? value.slice(0, 10) : value;
const statusBadge = (status: string) => status === 'Draft' ? <Badge variant="warning">{status}</Badge> : status === 'Completed' ? <Badge variant="success">{status}</Badge> : status === 'Cancelled' ? <Badge variant="danger">{status}</Badge> : <Badge variant="default">{status}</Badge>;

export function DetailsStockOpnamePage() {
  const { id } = useParams<{ id: string }>();
  const { data: stockOpname, isLoading, isError } = useQuery({ queryKey: ['inventory', 'stock-opnames', id], queryFn: () => stockOpnameService.fetchStockOpname(id!), enabled: !!id });
  if (isLoading) return <div className="p-8 text-center">Loading stock opname details...</div>;
  if (isError || !stockOpname) return <div className="p-8 text-center text-rose-400">Failed to load stock opname details.</div>;
  const items: StockOpnameItem[] = stockOpname.items ?? [];
  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/stock-opnames">Stock Opname</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Detail {stockOpname.opname_number}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-1"><CardTitle>Stock Opname Detail</CardTitle><CardDescription>Informasi lengkap mengenai Stock Opname #{stockOpname.opname_number}</CardDescription></div><div className="flex items-center gap-2">{statusBadge(stockOpname.status)}<Button asChild variant="secondary" size="sm"><Link to={`/inventory/stock-opnames/${stockOpname.id}/edit`}><Edit className="mr-1.5 h-4 w-4" />Edit</Link></Button></div></div>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[['Opname Number', stockOpname.opname_number], ['Opname Date', formatDate(stockOpname.opname_date)], ['Warehouse', stockOpname.warehouse?.warehouse_name ?? stockOpname.warehouse?.name ?? stockOpname.m_warehouses_id ?? '-'], ['Created At', formatDate(stockOpname.created_at ?? '')], ['Updated At', formatDate(stockOpname.updated_at ?? '')], ['Notes', stockOpname.notes ?? '-']].map(([label, value]) => <div key={String(label)} className="space-y-1"><p className="text-xs font-medium uppercase tracking-wider text-text/60">{label}</p><p className="text-sm font-semibold text-text-h">{String(value)}</p></div>)}
        </section>
        <section className="space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold text-text-h">Opname Items</h3><p className="text-sm text-text">List of products counted during stock opname</p></div><p className="text-sm text-text">{items.length} items</p></div>
          <div className="overflow-x-auto rounded-xl border border-border/80"><table className="min-w-[700px] w-full border-collapse text-left text-sm"><thead className="bg-surface-2"><tr>{['No', 'Product', 'System Qty', 'Physical Qty', 'Difference', 'Notes'].map((heading) => <th key={heading} className="table-head px-4 py-3 font-semibold text-text-h">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border/50 bg-surface-1">{items.length === 0 ? <tr><td className="px-4 py-5 text-text" colSpan={6}>No stock opname items found.</td></tr> : items.map((item, index) => <tr key={item.id ?? index} className="hover:bg-surface-2/70"><td className="px-4 py-3 font-medium text-text-h">{index + 1}</td><td className="px-4 py-3 text-text-h">{item.product?.product_name ?? item.product?.name ?? item.m_products_id ?? '-'}</td><td className="px-4 py-3 text-text-h">{item.system_qty ?? '-'}</td><td className="px-4 py-3 font-semibold text-text-h">{item.physical_qty}</td><td className="px-4 py-3 text-text-h">{item.difference_qty !== undefined ? <Badge variant={item.difference_qty > 0 ? 'success' : item.difference_qty < 0 ? 'danger' : 'default'}>{item.difference_qty > 0 ? '+' : ''}{item.difference_qty}</Badge> : '-'}</td><td className="px-4 py-3 text-text">{item.notes ?? '-'}</td></tr>)}</tbody></table></div>
        </section>
      </CardContent>
    </Card>
  );
}
