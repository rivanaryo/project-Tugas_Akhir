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
import type { Customer } from '../types/customer.types';

interface CustomersTableProps {
  data: Customer[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customer: Customer) => void;
  updatingCustomerId?: string | number | null;
  deletingCustomerId?: string | number | null;
}

export function CustomersTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onEditCustomer,
  onDeleteCustomer,
  updatingCustomerId,
  deletingCustomerId,
}: CustomersTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>
        ),
      },
      {
        accessorKey: 'customer_name',
        header: 'Nama Customer',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.customer_name}</span>
        ),
      },
      {
        accessorKey: 'contact_person',
        header: 'Kontak Person',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.contact_person ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'phone_number',
        header: 'Nomor Telepon',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.phone_number ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.email ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Alamat',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.address ?? '-'}</span>
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
        header: () => <span className="block text-right">Aksi</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onEditCustomer?.(row.original)}
              aria-label={`Edit ${row.original.customer_name}`}
              disabled={updatingCustomerId === row.original.id || deletingCustomerId === row.original.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDeleteCustomer?.(row.original)}
              aria-label={`Delete ${row.original.customer_name}`}
              disabled={updatingCustomerId === row.original.id || deletingCustomerId === row.original.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [rowStartNumber, onEditCustomer, onDeleteCustomer, updatingCustomerId, deletingCustomerId]
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
                  Loading customers...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-red-600" colSpan={columns.length}>
                  Gagal memuat data customers.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  Tidak ada data customers.
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
