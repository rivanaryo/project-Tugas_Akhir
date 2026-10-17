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
import type { Vendor } from '../types/vendor.types';

interface VendorsTableProps {
  data: Vendor[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
  onEditVendor?: (vendor: Vendor) => void;
  onDeleteVendor?: (vendor: Vendor) => void;
  updatingVendorId?: string | number | null;
  deletingVendorId?: string | number | null;
}

export function VendorsTable({
  data,
  isLoading,
  isError,
  rowStartNumber,
  onEditVendor,
  onDeleteVendor,
  updatingVendorId,
  deletingVendorId,
}: VendorsTableProps) {
  "use no memo";

  const columns = useMemo<ColumnDef<Vendor>[]>(
    () => [
      {
        id: 'rowNumber',
        header: 'No',
        cell: ({ row }) => (
          <span className="metric-number font-semibold text-text-h">{rowStartNumber + row.index}</span>
        ),
      },
      {
        accessorKey: 'vendor_name',
        header: 'Vendor Name',
        cell: ({ row }) => (
          <span className="font-semibold text-text-h">{row.original.vendor_name}</span>
        ),
      },
      {
        accessorKey: 'contact_person',
        header: 'Contact Person',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.contact_person ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone Number',
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
        header: 'Address',
        cell: ({ row }) => (
          <span className="text-text-h">{row.original.address ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) =>
          row.original.is_active ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="warning">Inactive</Badge>
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
              onClick={() => onEditVendor?.(row.original)}
              aria-label={`Edit ${row.original.vendor_name}`}
              disabled={updatingVendorId === row.original.id || deletingVendorId === row.original.id}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={() => onDeleteVendor?.(row.original)}
              aria-label={`Delete ${row.original.vendor_name}`}
              disabled={updatingVendorId === row.original.id || deletingVendorId === row.original.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [rowStartNumber, onEditVendor, onDeleteVendor, updatingVendorId, deletingVendorId]
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
                  Loading vendors...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-4 py-5 text-rose-400" colSpan={columns.length}>
                  Failed to load vendors.
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={columns.length}>
                  No vendors found.
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
