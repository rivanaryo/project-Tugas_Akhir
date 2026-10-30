"use no memo";

import { Link, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { SalesOrderItemsTable } from '../components/SalesOrderItemsTable';
import { useSalesOrder } from '../hooks/useSalesOrder';
import { useSalesOrderItems } from '../hooks/useSalesOrderItems';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';
import { Button } from '../../../../components/ui/button';

const formatDate = (value: string | undefined) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

const formatMoney = (value: string | number | null | undefined) => {
  const numberValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = numberValue !== null && numberValue !== undefined && Number.isFinite(numberValue) ? numberValue : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export function DetailsSalesOrderPage() {
  const { salesOrderId } = useParams<{ salesOrderId: string }>();
  const [page] = useState(1);
  const perPage = 100;
  const balance = useQuery({ queryKey: ['sales-order-balance', salesOrderId], queryFn: () => salesOrderService.fetchBalance(salesOrderId!), enabled: !!salesOrderId });

  const { data: salesOrder, isLoading: isHeadLoading, isError: isHeadError } = useSalesOrder(salesOrderId);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError } = useSalesOrderItems({
    salesOrderId,
    page,
    perPage,
  });

  if (isHeadLoading) {
    return <div className="p-8 text-center">Loading sales order details...</div>;
  }

  if (isHeadError || !salesOrder) {
    return <div className="p-8 text-center text-rose-400">Failed to load sales order details.</div>;
  }

  const status = salesOrder.status;
  const items = itemsData?.items ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/sales">Sales</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/sales/sales-orders">Sales Orders</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail {salesOrder.order_number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Sales Order Detail</CardTitle>
              <CardDescription>Informasi lengkap mengenai Sales Order #{salesOrder.order_number}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const s = status as string | number | boolean;
                if (s === 'dp_paid') return <Badge variant="info">DP Paid</Badge>;
                if (s === 'in_production') return <Badge variant="warning">In Production</Badge>;
                if (s === 'completed') return <Badge variant="success">Completed</Badge>;
                if (s === '1' || s === 1 || s === true || s === 'delivered') return <Badge variant="success">Delivered</Badge>;
                if (s === 'approved') return <Badge variant="warning">Approved</Badge>;
                if (s === '2' || s === 2 || s === 'cancelled' || s === 'canceled' || s === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
                return <Badge variant="default">Draft</Badge>;
              })()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {salesOrder.sales_quotation_id && <p className="text-sm text-text">Quotation asal: <Link className="font-semibold text-accent hover:underline" to={`/sales/sales-quotations/${salesOrder.sales_quotation_id}`}>Lihat Sales Quotation</Link></p>}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Nomor Order</p>
              <p className="text-sm font-semibold text-text-h">{salesOrder.order_number}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Tanggal Order</p>
              <p className="text-sm font-semibold text-text-h">{formatDate(salesOrder.order_date)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Customer</p>
              <p className="text-sm font-semibold text-text-h">
                {salesOrder.customer?.customer_name ?? String(salesOrder.customer_id ?? '-')}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Subtotal</p>
              <p className="text-sm font-semibold text-text-h">{formatMoney(salesOrder.subtotal)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Total Tax</p>
              <p className="text-sm font-semibold text-text-h">{formatMoney(salesOrder.total_tax)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Grand Total</p>
              <p className="text-lg font-bold text-accent">{formatMoney(salesOrder.grand_total)}</p>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <h3 className="font-semibold text-text-h">Saldo Sales Order</h3>
            {balance.isPending ? <p className="text-sm text-text">Memuat saldo...</p> : balance.isError ? <p role="alert" className="text-sm text-rose-400">Gagal memuat saldo. <Button variant="secondary" size="sm" onClick={() => void balance.refetch()}>Coba lagi</Button></p> : <div className="grid gap-4 sm:grid-cols-3">
              {([['Grand Total', balance.data.grand_total], ['Sudah Dibayar', balance.data.paid], ['Sisa Pembayaran', balance.data.remaining]] as const).map(([label, value]) => <div key={label}><p className="text-sm text-text">{label}</p><p className="font-semibold text-text-h">{formatMoney(value)}</p></div>)}
            </div>}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-h">Order Items</h3>
              <p className="text-sm text-text">{items.length} items</p>
            </div>

            <SalesOrderItemsTable
              data={items}
              isLoading={isItemsLoading}
              isError={isItemsError}
              rowStartNumber={1}
            />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
