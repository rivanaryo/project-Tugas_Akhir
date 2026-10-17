"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Badge } from '../../../../components/ui/badge';
import type { Pricelist } from '../types/pricelist.types';

interface PricelistsTableProps {
  data: Pricelist[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
}

const formatMoney = (rawValue: string, currency: string) => {
  const numericValue = Number(rawValue);
  const resolvedCurrency = currency?.trim() ? currency.trim() : 'IDR';

  if (!Number.isFinite(numericValue)) {
    return rawValue;
  }

  const maximumFractionDigits = resolvedCurrency.toUpperCase() === 'IDR' ? 0 : 2;

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: resolvedCurrency,
      maximumFractionDigits,
    }).format(numericValue);
  } catch {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits,
    }).format(numericValue);
  }
};

export function PricelistsTable({ data, isLoading, isError, rowStartNumber }: PricelistsTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<Pricelist>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>
        ),
      },
      {
        id: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.vendor?.vendor_name ?? '-'}</span>
        ),
      },
      {
        id: 'productName',
        header: 'Produk',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.product?.product_name ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'price',
        header: () => <div className="text-text-h table-head">Harga</div>,
        cell: ({ row }) => (
          <div className="metric-number text-text-h font-semibold">
            {formatMoney(row.original.price, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'currency',
        header: 'Mata Uang',
        cell: ({ row }) => <span className="text-text-h">{row.original.currency}</span>,
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
    ],
    [rowStartNumber]
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
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  Loading pricelists...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-rose-400" colSpan={columns.length}>
                  Gagal memuat data pricelists.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  Tidak ada data pricelists.
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
