"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Trash2, Eye, Pencil } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { SalesInvoiceHead } from '../types/salesInvoices';
import { Link } from 'react-router-dom';


interface SalesInvoiceTableProps {
  data: SalesInvoiceHead[];
  head?: SalesInvoiceHead;
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeleteSalesInvoice?: (salesInvoice: SalesInvoiceHead) => void;
  deletingSalesInvoiceId?: string | number | null;
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

export function SalesInvoiceTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeleteSalesInvoice,
  deletingSalesInvoiceId,
}: SalesInvoiceTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<SalesInvoiceHead>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>,
      },
      {
        accessorKey: 'invoice_number',
        header: 'Invoice Number',
        cell: ({ row }) => <span className="font-semibold text-text-h">{row.original.invoice_number}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Tipe',
        cell: ({ row }) => row.original.type === 'dp' ? <Badge variant="info">DP</Badge> : row.original.type === 'pelunasan' ? <Badge variant="default">Pelunasan</Badge> : '-',
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
        cell: ({ row }) => <span className="text-text-h">{row.original.items?.length ?? 0}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === 'paid' || status === 'completed') return <Badge variant="success">Paid</Badge>;
          if (status === true) return <Badge variant="success">Approved</Badge>;
          if (status === 'approved') return <Badge variant="success">Approved</Badge>;
          if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
          return <Badge variant="warning">Pending</Badge>;
        },
      },
      {
        accessorKey: 'invoice_date',
        header: 'Invoice Date',
        cell: ({ row }) => <span className="text-text-h">{formatDate(row.original.invoice_date)}</span>,
      },
      {
        accessorKey: 'grand_total',
        header: () => <div className="text-right table-head">Grand Total</div>,
        cell: ({ row }) => (
          <div className="metric-number text-right font-semibold text-text-h">{formatMoney(row.original.grand_total)}</div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right table-head">Actions</div>,
        cell: ({ row }) => {
          const isDeleting = deletingSalesInvoiceId !== null && String(deletingSalesInvoiceId) === String(row.original.id);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/sales/sales-invoices/${row.original.id}`} aria-label={`Detail ${row.original.invoice_number}`}>
                  <Eye className="h-4 w-4 text-blue-400 hover:text-blue-800" />
                </Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link to={`/sales/sales-invoices/${row.original.id}/edit`} aria-label={`Edit ${row.original.invoice_number}`}>  
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-400"
                onClick={() => onDeleteSalesInvoice?.(row.original)}
                disabled={isDeleting}
                aria-label={`Delete ${row.original.invoice_number}`}
              >
                <Trash2 className="h-4 w-4 text-rose-400 hover:text-red-800 cursor-pointer" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeleteSalesInvoice, deletingSalesInvoiceId]
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
                  Failed to load sales invoices.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No sales invoices found.
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
