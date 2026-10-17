"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { PurchaseOrderHead } from '../types/purchaseOrder.types';

interface PurchaseOrdersTableProps {
  data: PurchaseOrderHead[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeletePurchaseOrder?: (purchaseOrder: PurchaseOrderHead) => void;
  deletingPurchaseOrderId?: string | number | null;
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

export function PurchaseOrdersTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeletePurchaseOrder,
  deletingPurchaseOrderId,
}: PurchaseOrdersTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<PurchaseOrderHead>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        accessorKey: 'po_number',
        header: 'PO Number',
        cell: ({ row }) => (
          <Link
            to={`/inventory/purchase-orders/${row.original.id}`}
            className="font-semibold text-text-h hover:underline"
          >
            {row.original.po_number}
          </Link>
        ),
      },
      {
        id: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.vendor?.vendor_name ?? String(row.original.vendor_id ?? '-')}</span>
        ),
      },
      {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => {
          const items = row.original.items ?? [];
          if (items.length === 0) return <span className="text-text-h">-</span>;
          const products = Array.from(
            new Set(
              items
                .map((item) => item.product?.product_name ?? String(item.product_id ?? ''))
                .filter((name) => name)
            )
          );
          const preview = products.slice(0, 2).join(', ');
          const suffix = products.length > 2 ? ` +${products.length - 2}` : '';
          return <span className="text-text-h">{`${preview}${suffix}`}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === 'approved') return <Badge variant="success">Approved</Badge>;
          if (status === 'received') return <Badge variant="success">Received</Badge>;
          if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
          return <Badge variant="default">Draft</Badge>;
        },
      },
      {
        accessorKey: 'po_date',
        header: 'PO Date',
        cell: ({ row }) => <span className="text-text-h">{formatDate(row.original.po_date)}</span>,
      },
      {
        id: 'totalPrice',
        header: () => <div className="text-right table-head">Total Price</div>,
        cell: ({ row }) => {
          const direct = row.original.total_price;
          const directNumber = direct !== null && direct !== undefined ? Number(direct) : NaN;
          const fallback = (row.original.items ?? []).reduce((total, item) => {
            const itemTotal = Number(item.total_price ?? 0);
            if (Number.isFinite(itemTotal)) return total + itemTotal;
            return total + Number(item.quantity ?? 0) * Number(item.unit_price ?? 0);
          }, 0);
          const value = Number.isFinite(directNumber) ? directNumber : fallback;
          return <div className="metric-number text-right font-semibold text-text-h">{formatMoney(value ?? null)}</div>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right table-head">Actions</div>,
        cell: ({ row }) => {
          const isDeleting = deletingPurchaseOrderId !== null && String(deletingPurchaseOrderId) === String(row.original.id);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/inventory/purchase-orders/${row.original.id}`} aria-label={`Detail ${row.original.po_number}`}>
                  <Eye className="h-4 w-4 text-blue-400" />
                </Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/inventory/purchase-orders/${row.original.id}/edit`} aria-label={`Edit ${row.original.po_number}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                onClick={() => onDeletePurchaseOrder?.(row.original)}
                disabled={isDeleting}
                aria-label={`Delete ${row.original.po_number}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeletePurchaseOrder, deletingPurchaseOrderId]
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
                <td className="px-4 py-5 text-rose-400" colSpan={columns.length}>
                  Failed to load purchase orders.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No purchase orders found.
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
