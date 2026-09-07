"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { SalesOrderHead } from '../types/salesOrder.types';

interface SalesOrdersTableProps {
  data: SalesOrderHead[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeleteSalesOrder?: (salesOrder: SalesOrderHead) => void;
  deletingSalesOrderId?: string | number | null;
  itemsSummaryBySalesOrderId?: Record<
    string,
    {
      itemCount: number;
      products: string[];
      totalPrice: number;
    }
  >;
}

const formatDate = (value: string) => {
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

const normalizeSalesOrderStatus = (status: unknown): 'draft' | 'approved' | 'delivered' | 'cancelled' => {
  // Handle old status values from backend (0, 1, 2, pending, completed, cancelled)
  if (status === '0' || status === 0 || status === false || status === 'pending') return 'draft';
  if (status === '1' || status === 1 || status === true || status === 'completed') return 'delivered';
  if (status === '2' || status === 2 || status === 'cancelled' || status === 'canceled') return 'cancelled';

  // Handle new status values
  const text = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (text === 'draft') return 'draft';
  if (text === 'approved') return 'approved';
  if (text === 'delivered') return 'delivered';
  if (text === 'cancelled' || text === 'canceled') return 'cancelled';
  if (text === '0' || text === 'false' || text === 'pending') return 'draft';
  if (text === '1' || text === 'true' || text === 'completed') return 'delivered';
  if (text === '2' || text === 'cancelled' || text === 'canceled') return 'cancelled';

  return 'draft';
};

export function SalesOrdersTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeleteSalesOrder,
  deletingSalesOrderId,
  itemsSummaryBySalesOrderId,
}: SalesOrdersTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<SalesOrderHead>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        accessorKey: 'order_number',
        header: 'Order Number',
        cell: ({ row }) => (
          <Link
            to={`/sales/sales-orders/${row.original.id}`}
            className="font-semibold text-text-h hover:underline"
          >
            {row.original.order_number}
          </Link>
        ),
      },
      {
        id: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.customer?.customer_name ?? String(row.original.customer_id ?? '-')}</span>
        ),
      },
      {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => {
          const directItems = row.original.items ?? [];
          if (directItems.length > 0) {
            const products = Array.from(
              new Set(
                directItems
                  .map((item) => item.product?.product_name || item.product_name || String(item.product_id ?? ''))
                  .filter((name) => name)
              )
            );
            if (products.length === 0) return <span className="text-text-h">{directItems.length}</span>;
            const preview = products.slice(0, 2).join(', ');
            const suffix = products.length > 2 ? ` +${products.length - 2}` : '';
            return <span className="text-text-h">{`${preview}${suffix}`}</span>;
          }

          const summary = itemsSummaryBySalesOrderId?.[String(row.original.id)];
          if (!summary) return <span className="text-text-h">-</span>;
          if (summary.products.length === 0) return <span className="text-text-h">{summary.itemCount}</span>;
          const preview = summary.products.slice(0, 2).join(', ');
          const suffix = summary.products.length > 2 ? ` +${summary.products.length - 2}` : '';
          return <span className="text-text-h">{`${preview}${suffix}`}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const normalized = normalizeSalesOrderStatus(row.original.status);
          if (normalized === 'delivered') return <Badge variant="success">Delivered</Badge>;
          if (normalized === 'approved') return <Badge variant="warning">Approved</Badge>;
          if (normalized === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
          return <Badge variant="default">Draft</Badge>;
        },
      },
      {
        accessorKey: 'order_date',
        header: 'Order Date',
        cell: ({ row }) => <span className="text-text-h">{formatDate(row.original.order_date)}</span>,
      },
      {
        id: 'totalPrice',
        header: () => <div className="text-right table-head">Total Price</div>,
        cell: ({ row }) => {
          const direct = row.original.grand_total;
          const directNumber = direct !== null && direct !== undefined ? Number(direct) : NaN;
          const fallback = itemsSummaryBySalesOrderId?.[String(row.original.id)]?.totalPrice;
          const value = Number.isFinite(directNumber) ? directNumber : fallback;
          return <div className="metric-number text-right font-semibold text-text-h">{formatMoney(value ?? null)}</div>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right table-head">Actions</div>,
        cell: ({ row }) => {
          const isDeleting = deletingSalesOrderId !== null && String(deletingSalesOrderId) === String(row.original.id);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/sales/sales-orders/${row.original.id}`} aria-label={`Detail ${row.original.order_number}`}>
                  <Eye className="h-4 w-4 text-blue-600" />
                </Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/sales/sales-orders/${row.original.id}/edit`} aria-label={`Edit ${row.original.order_number}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDeleteSalesOrder?.(row.original)}
                disabled={isDeleting}
                aria-label={`Delete ${row.original.order_number}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeleteSalesOrder, deletingSalesOrderId, itemsSummaryBySalesOrderId]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-border/80">
      <div className="max-h-[60vh] overflow-auto">
        <table className="min-w-140 w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="table-head px-4 py-3 font-semibold text-text-h">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-surface-1">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-t border-border/80">
                  {Array.from({ length: columns.length }).map((__, cellIndex) => (
                    <td key={`skeleton-cell-${rowIndex}-${cellIndex}`} className="px-4 py-3">
                      <Skeleton className="h-4 w-28" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-red-600" colSpan={columns.length}>
                  Failed to load sales orders.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No sales orders found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border/80 hover:bg-surface-2/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[14px] text-text">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
