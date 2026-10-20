"use no memo";

import { useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import type { Product } from '../types/product.types';

interface ProductsTableProps {
  data: Product[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  updatingProductId?: string | number | null;
  deletingProductId?: string | number | null;
}

export function ProductsTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onEditProduct,
  onDeleteProduct,
  updatingProductId,
  deletingProductId,
}: ProductsTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>
        ),
      },
      {
        accessorKey: 'product_name',
        header: 'Product Name',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.product_name}</span>
        ),
      },
      {
        id: 'category_name',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.category?.category_name ?? '-'}</span>
        ),
      },
      {
        id: 'unit_name',
        header: 'Unit',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.unit?.unit_name ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) =>
          row.original.is_active ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="warning">Inactive</Badge>
          ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/100/10 hover:text-blue-300"
              onClick={() => onEditProduct?.(row.original)}
              aria-label={`Edit ${row.original.product_name}`}
              disabled={updatingProductId === row.original.id || deletingProductId === row.original.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={() => onDeleteProduct?.(row.original)}
              aria-label={`Delete ${row.original.product_name}`}
              disabled={updatingProductId === row.original.id || deletingProductId === row.original.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [rowStartNumber, onEditProduct, onDeleteProduct, updatingProductId, deletingProductId]
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
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-surface-1">
          {isLoading ? (
            <tr>
              <td className="px-4 py-5 text-text" colSpan={columns.length}>
                Loading products...
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td className="px-4 py-5 text-rose-400" colSpan={columns.length}>
                Failed to load products.
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className="px-4 py-5 text-text" colSpan={columns.length}>
                No products found.
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
          )}</tbody>
        </table>
      </div>
    </div>
  );
}
