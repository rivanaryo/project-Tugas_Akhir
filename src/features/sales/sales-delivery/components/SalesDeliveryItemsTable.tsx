"use no memo";

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useHorizontalScroll } from '../../../../hooks/useHorizontalScroll';
import type { SalesDeliveryItemDetail } from '../types/salesDelivery.types';


interface SalesDeliveryItemsTableProps {
  data: SalesDeliveryItemDetail[];
  isLoading: boolean;
  isError: boolean;
  rowStartNumber: number;
}

export function SalesDeliveryItemsTable({ data, isLoading, isError, rowStartNumber }: SalesDeliveryItemsTableProps) {
  "use no memo";
  const scrollRef = useHorizontalScroll();

  const columns = useMemo<ColumnDef<SalesDeliveryItemDetail>[]>(
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
            item.product?.product_name || 
            item.sales_order_item?.product?.product_name || 
            item.product_name || 
            String(item.product_id || item.sales_order_item_id || '-');
             
           return (
             <span className="font-semibold text-text-h">
               {productName}
             </span>
           );
         },
       },
       {
         accessorKey: 'qty_delivered',
         header: () => <div className="text-right table-head">Qty Delivered</div>,
         cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{row.original.qty_delivered}</div>,
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
