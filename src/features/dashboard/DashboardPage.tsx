import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  Scissors,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
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
    header: 'Type',
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

const activeProductions = [
  { id: 'SPK-001', product: 'Hoodie Fleece Custom', stage: 'Sewing', progress: 45 },
  { id: 'SPK-002', product: 'Polo Shirt Cotton Pique', stage: 'Printing/Bordir', progress: 25 },
  { id: 'SPK-003', product: 'Crewneck Sweatshirt', stage: 'Cutting', progress: 10 },
  { id: 'SPK-004', product: 'Jaket Bomber Varsity', stage: 'QC & Packing', progress: 85 },
];

const quickActions = [
  { label: 'Buat Sales Order', href: '/sales/sales-orders/create', icon: ClipboardList },
  { label: 'Buat Invoice DP', href: '/sales/sales-invoices/create', icon: Banknote },
  { label: 'Buat Work Order', href: '/production/work-orders', icon: Package },
  { label: 'Cek Material', href: '/production/material-checklist', icon: Scissors },
];

export const DashboardPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const queryKey = useMemo(() => ['dashboard', page, perPage], [page, perPage]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey,
    queryFn: () => dashboardService.fetchDashboardData({ page, per_page: perPage }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const pipelineMeta = dashboardData?.data?.pipeline;
  const pageOffset = (page - 1) * perPage;
  const canGoPrev = Boolean(pipelineMeta?.prev_page_url) && page > 1;
  const canGoNext = Boolean(pipelineMeta?.next_page_url);

  const revenueRows = useMemo(
    () => mapPipelineToRevenueRows(pipelineMeta?.data ?? [], pageOffset),
    [pipelineMeta, pageOffset]
  );

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Revenue Bulan Ini</CardDescription>
            <CardTitle className="metric-number text-[28px] leading-none">Rp 245.500.000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              +18% vs bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardDescription>Total Active PO</CardDescription>
            <CardTitle className="metric-number text-[28px] leading-none">12 PO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <ClipboardList className="h-4 w-4" />
              4 in production, 8 pending
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Material Expense</CardDescription>
            <CardTitle className="metric-number text-[28px] leading-none">Rp 87.300.000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-rose-400">
              <TrendingDown className="h-4 w-4" />
              -5% vs bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <CardDescription>Unpaid Invoices</CardDescription>
            <CardTitle className="metric-number text-[28px] leading-none">Rp 125.000.000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <AlertCircle className="h-4 w-4" />
              3 invoices pending
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-indigo-400" />
                Production Progress
              </CardTitle>
              <CardDescription>
                4 work order sedang aktif di jalur produksi
              </CardDescription>
            </div>
            <Badge variant="info">Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activeProductions.map((prod) => (
              <div key={prod.id} className="rounded-xl border border-border bg-surface-1/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-accent">{prod.id}</span>
                  <Badge variant="warning">{prod.stage}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-text-h">{prod.product}</p>
                <div className="mt-3 space-y-1">
                  <Progress value={prod.progress} className="h-2" />
                  <p className="text-xs text-text">{prod.progress}% complete</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Receivable Pipeline</CardTitle>
              <CardDescription>Live snapshot invoice DP dan Pelunasan</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Paid: Rp 157.5M
              </Badge>
              <Badge variant="warning" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Pending: Rp 125M
              </Badge>
            </div>
          </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button key={action.label} variant="secondary" className="h-20 flex-col gap-2" asChild>
                  <a href={action.href}>
                    <Icon className="h-5 w-5" />
                    <span>{action.label}</span>
                  </a>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
