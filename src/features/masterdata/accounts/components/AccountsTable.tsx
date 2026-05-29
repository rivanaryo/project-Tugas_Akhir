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
import type { Account } from '../types/account.types';

interface AccountsTableProps {
  data: Account[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onEditAccount?: (account: Account) => void;
  onDeleteAccount?: (account: Account) => void;
  updatingAccountId?: string | number | null;
  deletingAccountId?: string | number | null;
}

export function AccountsTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onEditAccount,
  onDeleteAccount,
  updatingAccountId,
  deletingAccountId,
}: AccountsTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<Account>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>
        ),
      },
      {
        accessorKey: 'account_name',
        header: 'Nama Akun',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.account_name}</span>
        ),
      },
      {
        accessorKey: 'account_number',
        header: 'Nomor Akun',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.account_number}</span>
        ),
      },
      {
        accessorKey: 'bank_name',
        header: 'Nama Bank',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.bank_name ?? '-'}</span>
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
              onClick={() => onEditAccount?.(row.original)}
              aria-label={`Edit ${row.original.account_name}`}
              disabled={updatingAccountId === row.original.id || deletingAccountId === row.original.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDeleteAccount?.(row.original)}
              aria-label={`Delete ${row.original.account_name}`}
              disabled={updatingAccountId === row.original.id || deletingAccountId === row.original.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [rowStartNumber, onEditAccount, onDeleteAccount, updatingAccountId, deletingAccountId]
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
                  Loading accounts...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-red-600" colSpan={columns.length}>
                  Gagal memuat data accounts.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  Tidak ada data accounts.
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
