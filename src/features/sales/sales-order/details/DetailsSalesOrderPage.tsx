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
    return <div className="p-8 text-center text-red-600">Failed to load sales order details.</div>;
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
              {status === true || status === '1' ? (
                <Badge variant="success">Completed</Badge>
              ) : status === '0' ? (
                <Badge variant="warning">Pending</Badge>
              ) : (
                <Badge variant="default">Unknown</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
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
