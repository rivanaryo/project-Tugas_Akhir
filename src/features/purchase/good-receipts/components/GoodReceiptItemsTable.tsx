import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { GoodReceiptItemDetail } from '../types/goodReceipt.types';

interface GoodReceiptItemsTableProps {
  data: GoodReceiptItemDetail[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
}

const formatMoney = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const numberValue = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue);
};

export function GoodReceiptItemsTable({ data, isLoading, isError, rowStartNumber }: GoodReceiptItemsTableProps) {
  const columns = useMemo<ColumnDef<GoodReceiptItemDetail>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        id: 'productName',
        header: 'Product',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">
            {row.original.product?.product_name ??
              row.original.purchase_order_item?.pricelist?.product?.product_name ??
              row.original.purchase_order_item?.pricelist?.product_name ??
              row.original.purchase_order_item?.product_name ??
              String(row.original.purchase_order_item?.product_id ?? row.original.product_id ?? '-')}
          </span>
        ),
      },
      {
        id: 'qtyOrdered',
        header: () => <div className="text-right table-head">Qty Ordered</div>,
        cell: ({ row }) => (
          <div className="metric-number text-right font-semibold text-text-h">{row.original.purchase_order_item?.quantity ?? '-'}</div>
        ),
      },
      {
        accessorKey: 'qty_received',
        header: () => <div className="text-right table-head">Qty Received</div>,
        cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{row.original.qty_received}</div>,
      },
      {
        id: 'unitPrice',
        header: () => <div className="text-right table-head">Unit Price</div>,
        cell: ({ row }) => (
          <div className="metric-number text-right font-semibold text-text-h">{formatMoney(row.original.purchase_order_item?.unit_price ?? null)}</div>
        ),
      },
      {
        id: 'totalValue',
        header: () => <div className="text-right table-head">Total Value</div>,
        cell: ({ row }) => {
          const qtyReceived = Number(row.original.qty_received ?? 0);
          const unitPrice = Number(row.original.purchase_order_item?.unit_price ?? 0);
          const total = Number.isFinite(qtyReceived) && Number.isFinite(unitPrice) ? qtyReceived * unitPrice : null;
          return <div className="metric-number text-right font-semibold text-text-h">{formatMoney(total)}</div>;
        },
      },
    ],
    [rowStartNumber]
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="rounded-xl border border-border/80">
      <div className="max-h-[55vh] overflow-auto">
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
                <td className="px-4 py-5 text-text" colSpan={columns.length}>Loading items...</td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-red-600" colSpan={columns.length}>Failed to load items.</td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>No items found.</td>
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
