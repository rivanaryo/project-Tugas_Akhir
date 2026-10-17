import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { StockBalanceItem } from '../types/stockBalance.types';

type SortField = 'product_name' | 'current_stock' | 'total_in' | 'total_out';
type SortDir = 'asc' | 'desc';

interface StockBalanceTableProps {
  data: StockBalanceItem[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  sortBy: string;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}

function SortableHeader({ label, field, sortBy, sortDir, onSort }: { label: string; field: SortField; sortBy: string; sortDir: SortDir; onSort: (f: SortField) => void }) {
  const isActive = sortBy === field;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-semibold text-text-h hover:text-accent transition-colors"
      onClick={() => onSort(field)}
    >
      {label}
      {isActive ? (
        sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );
}

function StockStatusBadge({ stock }: { stock: number }) {
  if (stock < 0) return <Badge variant="danger">Stok Negatif</Badge>;
  if (stock === 0) return <Badge variant="warning">Stok Habis</Badge>;
  return <Badge variant="success">Stok Aman</Badge>;
}

export function StockBalanceTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  sortBy,
  sortDir,
  onSort,
}: StockBalanceTableProps) {
  const columns = useMemo<ColumnDef<StockBalanceItem>[]>(
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
        header: () => (
          <SortableHeader label="Product Name" field="product_name" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.product_name}</span>
        ),
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => (
          <div>
            <span className="text-text-h">{row.original.warehouse_name}</span>
            {row.original.warehouse_code && (
              <span className="ml-1.5 text-xs text-text">({row.original.warehouse_code})</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'unit_code',
        header: 'Unit',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.unit_code || '-'}</span>
        ),
      },
      {
        accessorKey: 'total_in',
        header: () => (
          <SortableHeader label="Total In" field="total_in" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
        ),
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-emerald-700">{row.original.total_in.toLocaleString('id-ID')}</span>
        ),
      },
      {
        accessorKey: 'total_out',
        header: () => (
          <SortableHeader label="Total Out" field="total_out" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
        ),
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-rose-400">{row.original.total_out.toLocaleString('id-ID')}</span>
        ),
      },
      {
        accessorKey: 'current_stock',
        header: () => (
          <SortableHeader label="Current Stock" field="current_stock" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
        ),
        cell: ({ row }) => (
          <span className="metric-number text-lg font-bold text-text-h">{row.original.current_stock.toLocaleString('id-ID')}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StockStatusBadge stock={row.original.current_stock} />,
      },
    ],
    [rowStartNumber, sortBy, sortDir, onSort]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

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
              Array.from({ length: 8 }).map((_, rowIndex) => (
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
                  Gagal memuat data stock balance. Silakan coba lagi.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-center text-text" colSpan={columns.length}>
                  Tidak ada data stock balance ditemukan.
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
