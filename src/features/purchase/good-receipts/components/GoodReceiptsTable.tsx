import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { GoodReceiptHead } from '../types/goodReceipt.types';

interface GoodReceiptsTableProps {
  data: GoodReceiptHead[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeleteGoodReceipt?: (goodReceipt: GoodReceiptHead) => void;
  deletingGoodReceiptId?: string | number | null;
  itemsSummaryByGoodReceiptId?: Record<string, { itemCount: number; products: string[]; totalQtyReceived: number }>;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

export function GoodReceiptsTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeleteGoodReceipt,
  deletingGoodReceiptId,
  itemsSummaryByGoodReceiptId,
}: GoodReceiptsTableProps) {
  const columns = useMemo<ColumnDef<GoodReceiptHead>[]>(
    () => [
      { id: 'rowNumber', header: 'No', cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span> },
      {
        accessorKey: 'gr_number',
        header: 'GR Number',
        cell: ({ row }) => (
          <Link to={`/purchase/good-receipts/${row.original.id}`} className="font-semibold text-text-h hover:underline">
            {row.original.gr_number}
          </Link>
        ),
      },
      {
        id: 'poNumber',
        header: 'PO Number',
        cell: ({ row }) => <span className="text-text-h">{row.original.purchase_order?.po_number ?? String(row.original.purchase_order_id ?? '-')}</span>,
      },
      {
        id: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => <span className="text-text-h">{row.original.vendor?.vendor_name ?? String(row.original.vendor_id ?? '-')}</span>,
      },
      {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => {
          const summary = itemsSummaryByGoodReceiptId?.[String(row.original.id)];
          if (!summary) return <span className="text-text-h">-</span>;
          if (summary.products.length === 0) return <span className="text-text-h">{summary.itemCount}</span>;
          const preview = summary.products.slice(0, 2).join(', ');
          const suffix = summary.products.length > 2 ? ` +${summary.products.length - 2}` : '';
          return <span className="text-text-h">{`${preview}${suffix}`}</span>;
        },
      },
      {
        id: 'qtyReceived',
        header: () => <div className="text-right table-head">Qty Received</div>,
        cell: ({ row }) => (
          <div className="metric-number text-right font-semibold text-text-h">{itemsSummaryByGoodReceiptId?.[String(row.original.id)]?.totalQtyReceived ?? 0}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === 'delivered') return <Badge variant="success">Delivered</Badge>;
          if (status === 'approved') return <Badge variant="warning">Approved</Badge>;
          if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
          return <Badge variant="default">Draft</Badge>;
        },
      },
      { accessorKey: 'receipt_date', header: 'Receipt Date', cell: ({ row }) => <span className="text-text-h">{formatDate(row.original.receipt_date)}</span> },
      {
        id: 'actions',
        header: () => <div className="text-right table-head">Actions</div>,
        cell: ({ row }) => {
          const isDeleting = deletingGoodReceiptId !== null && String(deletingGoodReceiptId) === String(row.original.id);
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/purchase/good-receipts/${row.original.id}`} aria-label={`Detail ${row.original.gr_number}`}><Eye className="h-4 w-4 text-blue-600" /></Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/purchase/good-receipts/${row.original.id}/edit`} aria-label={`Edit ${row.original.gr_number}`}><Pencil className="h-4 w-4" /></Link>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDeleteGoodReceipt?.(row.original)} disabled={isDeleting} aria-label={`Delete ${row.original.gr_number}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeleteGoodReceipt, deletingGoodReceiptId, itemsSummaryByGoodReceiptId]
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
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-t border-border/80">
                  {Array.from({ length: columns.length }).map((__, cellIndex) => (
                    <td key={`skeleton-cell-${rowIndex}-${cellIndex}`} className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr><td className="px-4 py-5 text-red-600" colSpan={columns.length}>Failed to load good receipts.</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td className="px-4 py-5 text-text" colSpan={columns.length}>No good receipts found.</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border/80 hover:bg-surface-2/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[14px] text-text">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
