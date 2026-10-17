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
import type { Warehouse } from '../types/warehouse.types';

interface WarehousesTableProps {
  data: Warehouse[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onEditWarehouse?: (warehouse: Warehouse) => void;
  onDeleteWarehouse?: (warehouse: Warehouse) => void;
  updatingWarehouseId?: string | number | null;
  deletingWarehouseId?: string | number | null;
}

export function WarehousesTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onEditWarehouse,
  onDeleteWarehouse,
  updatingWarehouseId,
  deletingWarehouseId,
}: WarehousesTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<Warehouse>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>
        ),
      },
      {
        accessorKey: 'code',
        header: 'Kode Gudang',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Nama Gudang',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Lokasi',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.location}</span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) =>
          row.original.is_active ? (
            <Badge variant="success">Aktif</Badge>
          ) : (
            <Badge variant="warning">Tidak Aktif</Badge>
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
              onClick={() => onEditWarehouse?.(row.original)}
              aria-label={`Edit ${row.original.name}`}
              disabled={updatingWarehouseId === row.original.id || deletingWarehouseId === row.original.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={() => onDeleteWarehouse?.(row.original)}
              aria-label={`Delete ${row.original.name}`}
              disabled={updatingWarehouseId === row.original.id || deletingWarehouseId === row.original.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [rowStartNumber, onEditWarehouse, onDeleteWarehouse, updatingWarehouseId, deletingWarehouseId]
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
                Loading warehouses...
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td className="px-4 py-5 text-rose-400" colSpan={columns.length}>
                Failed to load warehouses.
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className="px-4 py-5 text-text" colSpan={columns.length}>
                No warehouses found.
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
