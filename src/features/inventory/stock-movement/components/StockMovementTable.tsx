"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { StockMovement } from '../types/stockMovement.types';

interface StockMovementTableProps {
  data: StockMovement[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeleteStockMovement?: (stockMovement: StockMovement) => void;
  deletingStockMovementId?: string | null;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

export function StockMovementTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeleteStockMovement,
  deletingStockMovementId,
}: StockMovementTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<StockMovement>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        accessorKey: 'reference_number',
        header: 'Reference Number',
        cell: ({ row }) => (
          <Link
            to={`/inventory/stock-movements/${row.original.id}`}
            className="font-semibold text-text-h hover:underline"
          >
            {row.original.reference_number}
          </Link>
        ),
      },
      {
        id: 'productName',
        header: 'Product',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.product?.product_name ?? row.original.product?.name ?? row.original.product_name ?? String(row.original.m_products_id ?? row.original.product_id ?? '-')}</span>
        ),
      },
      {
        id: 'warehouseName',
        header: 'Warehouse',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.warehouse?.name ?? row.original.warehouse?.warehouse_name ?? row.original.warehouse_name ?? String(row.original.m_warehouses_id ?? row.original.warehouse_id ?? '-')}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          if (row.original.type === 'in') return <Badge variant="success" className="gap-1"><ArrowUp className="h-3 w-3" />In</Badge>;
          return <Badge variant="danger" className="gap-1"><ArrowDown className="h-3 w-3" />Out</Badge>;
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ row }) => <span className="font-semibold text-text-h">{row.original.quantity}</span>,
      },
      {
        id: 'referenceable',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="text-text">{row.original.referenceable_type ?? row.original.document_type ?? row.original.reference ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => <span className="text-text-h">{formatDate(row.original.date ?? row.original.created_at ?? '')}</span>,
      },
      {
        id: 'actions',
        header: () => <div className="text-right table-head">Actions</div>,
        cell: ({ row }) => {
          const isDeleting = deletingStockMovementId !== null && String(deletingStockMovementId) === String(row.original.id);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/inventory/stock-movements/${row.original.id}`} aria-label={`Detail ${row.original.reference_number}`}>
                  <Eye className="h-4 w-4 text-blue-600" />
                </Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/inventory/stock-movements/${row.original.id}/edit`} aria-label={`Edit ${row.original.reference_number}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDeleteStockMovement?.(row.original)}
                disabled={isDeleting}
                aria-label={`Delete ${row.original.reference_number}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeleteStockMovement, deletingStockMovementId]
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
                  Failed to load stock movements.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No stock movements found.
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
