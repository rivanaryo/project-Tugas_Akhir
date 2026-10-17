"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useHorizontalScroll } from '../../../../hooks/useHorizontalScroll';
import type { SalesInvoiceItemDetail } from '../types/salesInvoices';


interface SalesInvoiceItemsTableProps {
  data: SalesInvoiceItemDetail[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
}

const formatMoney = (value: string | number | null | undefined) => {
  const numberValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = numberValue !== null && numberValue !== undefined && Number.isFinite(numberValue) ? numberValue : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export function SalesInvoiceItemsTable({ data, isLoading, isError, rowStartNumber }: SalesInvoiceItemsTableProps) {
  "use no memo";
  const scrollRef = useHorizontalScroll();

  const columns = useMemo<ColumnDef<SalesInvoiceItemDetail>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        id: 'productName',
        header: 'Product Name',
        cell: ({ row }) => {
          const item = row.original;
          const productName =
            item.sales_order_item?.product?.product_name ??
            String(item.sales_order_item_id ?? '-');

          return <span className="font-semibold text-text-h">{productName}</span>;
        },
      },
      {
        accessorKey: 'qty_invoice',
        header: () => <div className="text-right table-head">Qty Invoice</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{row.original.qty_invoice}</div>,
      },
      {
        accessorKey: 'unit_price',
        header: () => <div className="text-right table-head">Unit Price</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{formatMoney(row.original.unit_price)}</div>,
      },
      {
        accessorKey: 'subtotal',
        header: () => <div className="text-right table-head">Subtotal</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{formatMoney(row.original.subtotal)}</div>,
      },
      {
        accessorKey: 'tax_rate',
        header: () => <div className="text-right table-head">Tax Rate</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{String(row.original.tax_rate ?? '-')}</div>,
      },
      {
        accessorKey: 'tax_amount',
        header: () => <div className="text-right table-head">Tax Amount</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{formatMoney(row.original.tax_amount)}</div>,
      },
      {
        accessorKey: 'total_price',
        header: () => <div className="text-right table-head">Total Price</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{formatMoney(row.original.total_price)}</div>,
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
    <div className="rounded-xl border border-border/80 overflow-hidden">
      <div ref={scrollRef} className="max-h-[55vh] overflow-auto">
        <table className="min-w-[1000px] w-full border-collapse text-left text-sm">
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
                  Loading items...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-rose-400" colSpan={columns.length}>
                  Failed to load items.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No items found.
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
