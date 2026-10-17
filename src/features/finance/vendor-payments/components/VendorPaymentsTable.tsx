import { useMemo, useCallback } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useVendors } from '../../../masterdata/vendors/hooks/useVendors';
import { useAccounts } from '../../../masterdata/accounts/hooks/useAccounts';
import type { VendorPayment } from '../types/VendorPayment';
import { VENDOR_PAYMENT_STATUS_VARIANTS, getVendorPaymentStatusLabel } from '../constants/vendorPaymentStatus';

interface VendorPaymentsTableProps {
  data: VendorPayment[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onDeleteVendorPayment?: (vendorPayment: VendorPayment) => void;
  deletingVendorPaymentId?: string | number | null;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

const formatCurrency = (value: string | number) => {
  const num = Number(value);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

export function VendorPaymentsTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onDeleteVendorPayment,
  deletingVendorPaymentId,
}: VendorPaymentsTableProps) {
  const { data: vendorsData } = useVendors({ page: 1, perPage: 1000 }); // Get all vendors for lookup
  const { data: accountsData } = useAccounts({ page: 1, perPage: 1000 }); // Get all accounts for lookup

  const vendors = vendorsData?.items ?? [];
  const accounts = accountsData?.items ?? [];

  const getVendorName = useCallback((vendorId: string | number) => {
    const vendor = vendors.find(v => String(v.id) === String(vendorId));
    return vendor?.vendor_name || `Vendor ${vendorId}`;
  }, [vendors]);

  const getAccountName = useCallback((accountId: string | number) => {
    const account = accounts.find(a => String(a.id) === String(accountId));
    return account?.account_name || `Account ${accountId}`;
  }, [accounts]);
  const columns = useMemo<ColumnDef<VendorPayment>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        size: 50,
        cell: ({ row }) => <span className="font-medium text-text-h">{rowStartNumber + row.index}</span>
      },
      {
        accessorKey: 'payment_number',
        header: 'Payment Number',
        size: 140,
        cell: ({ row }) => (
          <Link to={`/finance/vendor-payments/${row.original.id}`} className="font-semibold text-primary hover:underline">
            {row.original.payment_number}
          </Link>
        ),
      },
      {
        accessorKey: 'vendor_invoice_number',
        header: 'Invoice Number',
        size: 130,
        cell: ({ row }) => <span>{row.original.vendor_invoice_number}</span>,
      },
      {
        id: 'vendorName',
        header: 'Vendor',
        size: 160,
        cell: ({ row }) => <span>{getVendorName(row.original.vendor_id)}</span>,
      },
      {
        accessorKey: 'payment_type',
        header: 'Type',
        size: 100,
        cell: ({ row }) => {
          const type = row.original.payment_type;
          const variants = {
            transfer: 'default' as const,
            cash: 'success' as const,
            giro: 'warning' as const,
            downpayment: 'info' as const,
          };
          return <Badge variant={variants[type]} className="capitalize">{type}</Badge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ row }) => {
          const status = row.original.status;
          const variant = VENDOR_PAYMENT_STATUS_VARIANTS[status] || 'default';
          return (
            <Badge variant={variant} className="capitalize">
              {getVendorPaymentStatusLabel(status)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'total_paid',
        header: () => <div className="text-right">Total Paid</div>,
        size: 130,
        cell: ({ row }) => (
          <div className="text-right font-semibold text-text-h">
            {formatCurrency(row.original.total_paid)}
          </div>
        ),
      },
      {
        id: 'accountName',
        header: 'Account',
        size: 140,
        cell: ({ row }) => <span>{getAccountName(row.original.account_id)}</span>,
      },
      {
        accessorKey: 'payment_date',
        header: 'Payment Date',
        size: 110,
        cell: ({ row }) => <span>{formatDate(row.original.payment_date)}</span>
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        size: 100,
        cell: ({ row }) => {
          const isDeleting = deletingVendorPaymentId !== null && String(deletingVendorPaymentId) === String(row.original.id);
          return (
            <div className="flex items-center justify-center gap-1">
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/100/10">
                <Link to={`/finance/vendor-payments/${row.original.id}`} aria-label={`Detail ${row.original.payment_number}`}>
                  <Eye className="h-4 w-4 text-blue-400" />
                </Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-amber-500/100/10">
                <Link to={`/finance/vendor-payments/${row.original.id}/edit`} aria-label={`Edit ${row.original.payment_number}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-rose-500/10"
                onClick={() => onDeleteVendorPayment?.(row.original)}
                disabled={isDeleting}
                aria-label={`Delete ${row.original.payment_number}`}
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rowStartNumber, onDeleteVendorPayment, deletingVendorPaymentId, getVendorName, getAccountName]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <div className="max-h-[65vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/70">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="px-4 py-3 text-left font-semibold text-text-h"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/70">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="bg-surface-1 hover:bg-surface-2/50">
                  {Array.from({ length: columns.length }).map((__, cellIndex) => (
                    <td key={`skeleton-cell-${rowIndex}-${cellIndex}`} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr className="bg-rose-500/10">
                <td className="px-4 py-6 text-center text-rose-400 font-medium" colSpan={columns.length}>
                  Gagal memuat data pembayaran vendor
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr className="bg-surface-1">
                <td className="px-4 py-8 text-center text-text/60" colSpan={columns.length}>
                  Tidak ada data pembayaran vendor
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2'
                  } hover:bg-surface-2/60`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.columnDef.size }}
                      className="px-4 py-3 text-text"
                    >
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