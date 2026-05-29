import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpRight, CircleDollarSign, ChevronLeft, ChevronRight, HandCoins, Wallet } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { dashboardService, mapPipelineToRevenueRows } from './services/dashboard.service';
import type { RevenueRow } from './types/dashboard.types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const columns: ColumnDef<RevenueRow>[] = [
  {
    accessorKey: 'invoice',
    header: 'Invoice',
    cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{row.original.invoice}</span>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'module',
    header: 'Module',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusLower = status.toLowerCase();
      const variant =
        statusLower === 'paid' || statusLower === 'approved'
          ? 'success'
          : statusLower === 'pending' || statusLower === 'unpaid'
            ? 'warning'
            : statusLower === 'overdue'
              ? 'danger'
              : statusLower === 'cancelled' || statusLower === 'rejected'
                ? 'danger'
                : 'default';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => <span className="metric-number">{row.original.dueDate}</span>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right table-head">Amount</div>,
    cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{formatCurrency(row.original.amount)}</div>,
  },
];


export const DashboardPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Stabilize query key to prevent infinite refetching
  const queryKey = useMemo(() => ['dashboard', page, perPage], [page, perPage]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey,
    queryFn: () => dashboardService.fetchDashboardData({ page, per_page: perPage }),
    staleTime: 30000, // 30 seconds - prevent refetching too frequently
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Extract pipeline data from Laravel pagination structure
  const pipelineMeta = dashboardData?.data?.pipeline;
  
  // Calculate offset for unique row IDs across pages
  const pageOffset = (page - 1) * perPage;
  
  const canGoPrev = Boolean(pipelineMeta?.prev_page_url) && page > 1;
  const canGoNext = Boolean(pipelineMeta?.next_page_url);

  // Memoize revenue rows to prevent unnecessary re-renders
  const revenueRows = useMemo(
    () => mapPipelineToRevenueRows(pipelineMeta?.data ?? [], pageOffset),
    [pipelineMeta, pageOffset]
  );

  const kpi = dashboardData?.data?.kpi;

  // Get row ID from our unique data ID to prevent React Table ID conflicts
  const getRowId = useCallback((row: RevenueRow) => row.id, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: revenueRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gross Revenue</CardDescription>
                <CardTitle className="metric-number text-[28px] leading-none">
                  {kpi ? formatCurrency(kpi.gross_revenue.value) : '-'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CircleDollarSign className="h-4 w-4" />
                  {kpi ? `+${kpi.gross_revenue.growth}% month-over-month` : 'Loading...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cash In Bank</CardDescription>
                <CardTitle className="metric-number text-[28px] leading-none">
                  {kpi ? `${kpi.cash_in_bank.value}` : '-'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-text">
                  <Wallet className="h-4 w-4" />
                  {kpi ? `${kpi.cash_in_bank.accounts} active accounts` : 'Loading...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Payables</CardDescription>
                <CardTitle className="metric-number text-[28px] leading-none">
                  {kpi ? formatCurrency(kpi.pending_payables.value) : '-'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <HandCoins className="h-4 w-4" />
                  {kpi ? `${kpi.pending_payables.due_this_week} invoices due this week` : 'Loading...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Collection Rate</CardDescription>
                <CardTitle className="metric-number text-[28px] leading-none">
                  {kpi ? `${kpi.collection_rate.value}%` : '-'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                  Healthy trend this quarter
                </div>
              </CardContent>
            </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Receivable Pipeline</CardTitle>
          <CardDescription>Live snapshot from Sales, Purchase, and Banking streams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-2">
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
                      Loading financial rows...
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
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {pipelineMeta 
                ? `Menampilkan ${pipelineMeta.from}-${pipelineMeta.to} dari ${pipelineMeta.total} items` 
                : 'Menampilkan 0 items'}
            </p>

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setPage(Math.max(1, page - 1))} 
                disabled={!canGoPrev || isLoading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Sebelumnya
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Halaman {pipelineMeta?.current_page ?? page} / {pipelineMeta?.last_page ?? 1}
              </span>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setPage(page + 1)} 
                disabled={!canGoNext || isLoading}
              >
                Selanjutnya
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
