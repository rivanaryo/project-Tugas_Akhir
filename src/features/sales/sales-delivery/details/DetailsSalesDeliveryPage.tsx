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
import { useSalesDelivery } from '../hooks/useSalesDelivery';
import { useSalesDeliveryItems } from '../hooks/useSalesDeliveryItems';
import { useState } from 'react';
import { SalesDeliveryItemsTable } from '../components/SalesDeliveryItemsTable';

const formatDate = (value: string | undefined) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

export function DetailsSalesDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const [page] = useState(1);
  const perPage = 100;

  const { data: salesDelivery, isLoading: isHeadLoading, isError: isHeadError } = useSalesDelivery(id);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError } = useSalesDeliveryItems({
    salesDeliveryId: id,
    page,
    perPage,
  });

  if (isHeadLoading) {
    return <div className="p-8 text-center">Loading sales delivery details...</div>;
  }

  if (isHeadError || !salesDelivery) {
    return <div className="p-8 text-center text-red-600">Failed to load sales delivery details.</div>;
  }

  const items = itemsData?.items?.length ? itemsData.items : (salesDelivery?.items ?? []);

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
                  <Link to="/sales/sales-deliveries">Sales Deliveries</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail {salesDelivery.delivery_number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Sales Delivery Detail</CardTitle>
              <CardDescription>Informasi lengkap mengenai Sales Delivery #{salesDelivery.delivery_number}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const s = salesDelivery?.status as string | number | boolean;
                if (s === '1' || s === 1 || s === true || s === 'completed' || s === 'delivered') return <Badge variant="success">Delivered</Badge>;
                if (s === 'approved') return <Badge variant="warning">Approved</Badge>;
                if (s === '2' || s === 2 || s === 'cancelled' || s === 'canceled' || s === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
                return <Badge variant="default">Draft</Badge>;
              })()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Nomor Delivery</p>
              <p className="text-sm font-semibold text-text-h">{salesDelivery?.delivery_number}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Tanggal Delivery</p>
              <p className="text-sm font-semibold text-text-h">{formatDate(salesDelivery.delivery_date)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">Customer</p>
              <p className="text-sm font-semibold text-text-h">
                {salesDelivery.customer?.customer_name ?? String(salesDelivery.customer_id ?? '-')}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text/60">SO Reference</p>
              <p className="text-sm font-semibold text-text-h">{salesDelivery.sales_order?.order_number ?? '-'}</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-h">Delivery Items</h3>
              <p className="text-sm text-text">{items.length} items</p>
            </div>

            <SalesDeliveryItemsTable data={items} isLoading={isItemsLoading} isError={isItemsError} rowStartNumber={1} />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
