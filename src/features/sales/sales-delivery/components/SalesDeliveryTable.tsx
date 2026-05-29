"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { SalesDeliveryHead } from '../types/salesDelivery.types';

interface SalesDeliveryTableProps {
  data: SalesDeliveryHead[];
  head?: SalesDeliveryHead;
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeleteSalesDelivery?: (salesDelivery: SalesDeliveryHead) => void;
  deletingSalesDeliveryId?: string | number | null;
  itemsSummaryBySalesDeliveryId?: Record<
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

const normalizeSalesDeliveryStatus = (status: unknown): '0' | '1' | '2' => {
  if (status === true || status === 1 || status === '1') return '1';
  if (status === 2 || status === '2') return '2';
  if (status === false || status === 0 || status === '0') return '0';

  const text = typeof status === 'string' ? status.trim().toLowerCase() : '';

  if (text === '1') return '1';
  if (text === '2') return '2';
  if (text === '0') return '0';
  if (text === 'true') return '1';
  if (text === 'false') return '0';
  if (text === 'completed') return '1';
  if (text === 'cancelled' || text === 'canceled') return '2';
  if (text === 'pending') return '0';

  return '0';
};

export function SalesDeliveryTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeleteSalesDelivery,
  deletingSalesDeliveryId,
  itemsSummaryBySalesDeliveryId,
}: SalesDeliveryTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<SalesDeliveryHead>[]>(  
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        accessorKey: 'delivery_number',
        header: 'Delivery Number',
        cell: ({ row }) => (
          <Link
            to={`/sales/sales-deliveries/${row.original.id}`}
            className="font-semibold text-text-h hover:underline"
          >
            {row.original.delivery_number}
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
          const summary = itemsSummaryBySalesDeliveryId?.[String(row.original.id)];
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
          const normalized = normalizeSalesDeliveryStatus(row.original.status);
          if (normalized === '1') return <Badge variant="success">Completed</Badge>;
          if (normalized === '2') return <Badge variant="danger">Cancelled</Badge>;
          return <Badge variant="warning">Pending</Badge>;
        },
      },
      {
        accessorKey: 'delivery_date',
        header: 'Delivery Date',
        cell: ({ row }) => <span className="text-text-h">{formatDate(row.original.delivery_date)}</span>,
      },
      {
        id: 'actions',
        header: () => <div className="text-right table-head">Actions</div>,
        cell: ({ row }) => {
          const isDeleting = deletingSalesDeliveryId !== null && String(deletingSalesDeliveryId) === String(row.original.id);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/sales/sales-deliveries/${row.original.id}`} aria-label={`Detail ${row.original.delivery_number}`}>
                  <Eye className="h-4 w-4 text-blue-600" />
                </Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/sales/sales-deliveries/${row.original.id}/edit`} aria-label={`Edit ${row.original.delivery_number}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDeleteSalesDelivery?.(row.original)}
                disabled={isDeleting}
                aria-label={`Delete ${row.original.delivery_number}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeleteSalesDelivery, deletingSalesDeliveryId, itemsSummaryBySalesDeliveryId]
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
                  Failed to load sales deliveries.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No sales deliveries found.
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
