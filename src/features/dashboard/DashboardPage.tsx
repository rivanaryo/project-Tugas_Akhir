import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Banknote, ChevronLeft, ChevronRight, ClipboardList, Package, Scissors, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { dashboardService, mapPipelineToRevenueRows } from './services/dashboard.service';
import type { RevenueRow } from './types/dashboard.types';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'Belum ditentukan';
const columns: ColumnDef<RevenueRow>[] = [
  { accessorKey: 'invoice', header: 'Invoice', cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{row.original.invoice}</span> },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'invoiceType', header: 'Jenis Invoice' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Paid' ? 'success' : row.original.status === 'Overdue' ? 'danger' : 'warning'}>{row.original.status}</Badge> },
  { accessorKey: 'dueDate', header: 'Jatuh Tempo', cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.dueDate)}</span> },
  ...([
    ['amount', 'Nominal Invoice'], ['paidAmount', 'Terbayar'], ['outstandingAmount', 'Sisa Tagihan'],
  ] as const).map(([key, title]): ColumnDef<RevenueRow> => ({
    accessorKey: key, header: () => <div className="text-right">{title}</div>,
    cell: ({ row }) => <div className="metric-number whitespace-nowrap text-right font-semibold text-text-h">{formatCurrency(row.original[key])}</div>,
  })),
];

const quickActions = [
  { label: 'Buat Sales Order', href: '/sales/sales-orders/create', icon: ClipboardList },
  { label: 'Buat Invoice DP', href: '/sales/sales-invoices/create', icon: Banknote },
  { label: 'Buat Work Order', href: '/production/work-orders', icon: Package },
  { label: 'Cek Material', href: '/production/material-checklist', icon: Scissors },
];

function Growth({ value, expense = false }: { value: number; expense?: boolean }) {
  const Icon = value < 0 ? TrendingDown : TrendingUp;
  const favorable = expense ? value < 0 : value > 0;
  return <div className={`flex items-center gap-2 text-sm ${value === 0 ? 'text-text' : favorable ? 'text-emerald-400' : 'text-rose-400'}`}><Icon className="h-4 w-4 shrink-0" />{value > 0 ? '+' : ''}{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)}% vs periode setara bulan lalu</div>;
}

export function DashboardPage() {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: ['dashboard', page, perPage],
    queryFn: () => dashboardService.fetchDashboardData({ page, per_page: perPage, active_work_orders_limit: 4 }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  const dashboard = data?.data;
  const kpi = dashboard?.kpi;
  const pipeline = dashboard?.pipeline;
  const summary = dashboard?.pipeline_summary;
  const productions = dashboard?.active_work_orders ?? [];
  const revenueRows = useMemo(() => mapPipelineToRevenueRows(pipeline?.data, ((pipeline?.current_page ?? 1) - 1) * perPage), [pipeline]);
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: revenueRows, columns, getCoreRowModel: getCoreRowModel() });
  const from = pipeline?.from ?? (pipeline?.data.length ? (pipeline.current_page - 1) * pipeline.per_page + 1 : 0);
  const to = pipeline?.to ?? (pipeline?.data.length ? from + pipeline.data.length - 1 : 0);
  const amount = (value: number | undefined) => value === undefined ? isLoading ? 'Memuat...' : '—' : formatCurrency(value);

  return (
    <div className="space-y-6" aria-busy={isFetching}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-text-h">Dashboard</h1><p className="mt-1 text-sm text-text">Ringkasan bisnis · KPI bulan berjalan dibanding periode setara bulan lalu · UTC</p></div><Button variant="secondary" size="sm" disabled={isFetching} onClick={() => void refetch()}>{isFetching ? 'Memperbarui...' : 'Refresh'}</Button></div>
      {isError && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">Gagal memuat dashboard. {data ? 'Data yang ditampilkan adalah data sebelumnya. ' : ''}Silakan coba Refresh.</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="min-w-0 border-l-4 border-l-blue-500"><CardHeader className="pb-2"><CardDescription>Revenue Bulan Ini</CardDescription><CardTitle className="metric-number break-words text-2xl">{amount(kpi?.revenue_month.value)}</CardTitle></CardHeader><CardContent className="space-y-2">{kpi && <Growth value={kpi.revenue_month.growth} />}<p className="text-xs text-text">Nilai invoice diterbitkan, bukan penerimaan kas.</p></CardContent></Card>
        <Card className="min-w-0 border-l-4 border-l-indigo-500"><CardHeader className="pb-2"><CardDescription>Purchase Order Aktif</CardDescription><CardTitle className="metric-number text-2xl">{kpi ? `${kpi.active_po.value} PO` : isLoading ? 'Memuat...' : '—'}</CardTitle></CardHeader><CardContent className="space-y-2">{kpi && <><p className="text-sm text-text">{kpi.active_po.breakdown.draft} draft · {kpi.active_po.breakdown.approved} approved</p><p className="text-xs text-text">{kpi.active_po.breakdown.received} received · {kpi.active_po.breakdown.cancelled} cancelled (tidak aktif)</p></>}</CardContent></Card>
        <Card className="min-w-0 border-l-4 border-l-amber-500"><CardHeader className="pb-2"><CardDescription>Material Expense</CardDescription><CardTitle className="metric-number break-words text-2xl">{amount(kpi?.material_expense.value)}</CardTitle></CardHeader><CardContent className="space-y-2">{kpi && <Growth value={kpi.material_expense.growth} expense />}<p className="text-xs text-text">Pembayaran vendor berstatus paid bulan ini.</p></CardContent></Card>
        <Card className="min-w-0 border-l-4 border-l-rose-500"><CardHeader className="pb-2"><CardDescription>Unpaid Invoices</CardDescription><CardTitle className="metric-number break-words text-2xl">{amount(kpi?.unpaid_invoices.value)}</CardTitle></CardHeader><CardContent><p className="text-sm text-amber-400">{kpi ? `${kpi.unpaid_invoices.count} invoice belum lunas, termasuk pembayaran sebagian` : '—'}</p></CardContent></Card>
      </div>
      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-blue-500/5">
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><Scissors className="h-5 w-5 text-indigo-400" />Production Progress</CardTitle><CardDescription>{dashboard ? `${dashboard.active_work_orders_total} work order aktif · menampilkan ${productions.length} prioritas teratas` : isLoading ? 'Memuat work order...' : 'Data belum tersedia'}</CardDescription></div><Button asChild variant="secondary" size="sm"><Link to="/production/work-orders">Lihat Semua</Link></Button></div></CardHeader>
        <CardContent>{isLoading ? <p className="text-sm text-text">Memuat progres produksi...</p> : !dashboard ? <p className="text-sm text-text">Progres produksi belum tersedia.</p> : productions.length === 0 ? <p className="text-sm text-text">Belum ada work order aktif.</p> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{productions.map((prod) => <div key={prod.id} className="rounded-xl border border-border bg-surface-1/80 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs font-semibold text-accent">{prod.work_order_number}</span><Badge variant="warning">{prod.stage}</Badge></div><p className="mt-2 text-sm font-medium text-text-h">{prod.product_name}</p><p className="mt-1 text-xs text-text">{prod.status}</p><div className="mt-3 space-y-1"><Progress value={prod.progress} className="h-2" /><p className="text-xs text-text">{prod.progress}% complete</p></div></div>)}</div>}</CardContent>
      </Card>
      <Card>
        <CardHeader><div className="space-y-4"><div><CardTitle>Receivable Pipeline</CardTitle><CardDescription>Invoice DP dan pelunasan · ringkasan seluruh invoice, bukan hanya halaman ini.</CardDescription></div><div className="flex flex-wrap gap-2">{summary && <><Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Terbayar: {formatCurrency(summary.paid_amount)} · {summary.paid_count} invoice lunas</Badge><Badge variant="warning" className="gap-1"><AlertCircle className="h-3 w-3" />Outstanding: {formatCurrency(summary.pending_amount)} · {summary.pending_count} invoice</Badge><Badge variant="danger">Overdue: {formatCurrency(summary.overdue_amount)} · {summary.overdue_count} invoice</Badge></>}</div><p className="text-xs text-text">Overdue termasuk outstanding. Pembayaran sebagian berkontribusi pada nominal terbayar dan sisa tagihan.</p></div></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/80"><table className="w-full min-w-[900px] border-collapse text-left text-sm"><thead className="bg-surface-2">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="table-head px-4 py-3 font-semibold text-text-h">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody className="bg-surface-1">{isLoading || !pipeline || revenueRows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-6 text-center text-text">{isLoading ? 'Memuat invoice...' : !pipeline ? 'Data invoice tidak tersedia.' : 'Belum ada invoice.'}</td></tr> : table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t border-border/80 hover:bg-surface-2/70">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 text-text">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-text">{pipeline ? `Menampilkan ${from}-${to} dari ${pipeline.total} invoice` : 'Data belum tersedia'}</p><div className="flex items-center gap-2"><Button variant="secondary" size="sm" disabled={!pipeline || pipeline.current_page <= 1 || isFetching || isPlaceholderData} onClick={() => setPage(Math.max(1, page - 1))}><ChevronLeft className="h-4 w-4" />Sebelumnya</Button><span className="metric-number text-xs text-text-h">Halaman {pipeline?.current_page ?? page} / {pipeline?.last_page ?? 1}</span><Button variant="secondary" size="sm" disabled={!pipeline || pipeline.current_page >= pipeline.last_page || isFetching || isPlaceholderData} onClick={() => setPage(page + 1)}>Selanjutnya<ChevronRight className="h-4 w-4" /></Button></div></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{quickActions.map(({ label, href, icon: Icon }) => <Button key={href} variant="secondary" className="h-20 flex-col gap-2" asChild><Link to={href}><Icon className="h-5 w-5" /><span>{label}</span></Link></Button>)}</div></CardContent></Card>
    </div>
  );
}
