'use no memo';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { warehouseService } from '../../masterdata/warehouses/services/warehouseService';
import { workOrderService } from '../work-orders/services/workOrderService';
import type { StockMovement } from '../../inventory/stock-movement/types/stockMovement.types';
import { finishedGoodsReceiptService as service } from './finishedGoodsReceipt.service';
import { finishedGoodsReceiptInputSchema, receiptStatuses, type FinishedGoodsReceipt, type FinishedGoodsReceiptInput, type ReceiptFilters, type ReceiptStatus } from './finishedGoodsReceipt.schemas';

const base = '/production/finished-goods-receipts';
const emptyFilters: ReceiptFilters = { q: '', status: '', warehouse_id: '', work_order_id: '', date_from: '', date_to: '' };
const receivedEffect = 'Status received menambah stok barang jadi dan mengeluarkan bahan baku otomatis (backflushing) sebesar BOM usage × qty baik. Backend juga memperbarui jumlah selesai/reject SPK serta membuat draft Sales Delivery. Produk dan ukuran diambil dari SPK.';
const rollbackEffect = 'Jika penerimaan received dibatalkan, dikembalikan ke draft, atau dihapus, backend akan me-rollback efek penerimaan pada stok dan progres SPK, serta menghapus draft Sales Delivery terkait. Periksa kembali saldo barang jadi dan bahan baku setelah proses.';
const backflushingInfo = 'Pemakaian bahan baku dihitung backend dari BOM pada tech pack SPK. Jika tidak tersedia, backend memakai tech pack approved terbaru untuk produk tersebut. Dasar pemakaian adalah qty baik, bukan qty reject. Draft tidak memengaruhi stok.';
const count = (value: number) => value.toLocaleString('id-ID', { maximumFractionDigits: 20 });

function message(error: unknown) {
  if (error instanceof z.ZodError) return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) return error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join('; ') : error.response?.data?.message || 'Gagal menghubungi server';
  return error instanceof Error ? error.message : 'Gagal memproses penerimaan hasil produksi';
}

function useRefreshProduction() {
  const client = useQueryClient();
  return () => Promise.all(['production', 'inventory', 'sales', 'masterdata', 'dashboard'].map((root) => client.invalidateQueries({ queryKey: [root] })));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset className="min-w-0 space-y-2 text-sm text-text-h"><legend className="mb-2 font-medium">{label}</legend>{children}</fieldset>;
}

function Modal({ open, title, description, pending, onClose, children }: { open: boolean; title: string; description: string; pending: boolean; onClose: () => void; children: ReactNode }) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next && !pending) onClose(); }}><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" onEscapeKeyDown={(event) => { if (pending) event.preventDefault(); }} onPointerDownOutside={(event) => event.preventDefault()}><DialogHeader className="mb-5"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>;
}

function DataTable<T extends { id: string }>({ data, columns, loading, error, retry }: { data: T[]; columns: ColumnDef<T>[]; loading: boolean; error?: unknown; retry: () => void }) {
  'use no memo';
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id });
  return <div className="overflow-auto rounded-xl border border-border/80"><table className="w-full min-w-140 border-collapse text-left text-sm"><thead className="sticky top-0 z-10 bg-surface-2">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="table-head px-4 py-3 font-semibold text-text-h">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody className="bg-surface-1">
    {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index} className="border-t border-border/80">{columns.map((_, column) => <td key={column} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>)}</tr>) : error ? <tr><td role="alert" colSpan={columns.length} className="px-4 py-5 text-rose-400">{message(error)} <Button type="button" variant="secondary" size="sm" onClick={retry}>Coba lagi</Button></td></tr> : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t border-border/80 hover:bg-surface-2/70">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 text-text">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-5 text-center text-text">Tidak ada data ditemukan.</td></tr>}
  </tbody></table></div>;
}

type Reference = { id: string; name: string; description: string };
function ReferencePicker({ kind, value, onChange }: { kind: 'warehouse' | 'work-order'; value: Reference | null; onChange: (value: Reference | null) => void }) {
  const title = kind === 'warehouse' ? 'Gudang' : 'SPK';
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [search] = useDebounce(q, 300);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['production', 'fgr-reference', kind, page, search], enabled: open,
    queryFn: async () => {
      if (kind === 'warehouse') {
        const result = await warehouseService.fetchWarehouses(page, 10, { q: search });
        return { items: result.items.map((item) => ({ id: String(item.id), name: item.name, description: item.code ?? '' })), meta: result.meta };
      }
      const result = await workOrderService.fetchWorkOrders(page, 10, { q: search });
      return { items: result.items.map((item) => ({ id: item.id, name: item.wo_number, description: `${item.product?.product_name ?? item.product_id} · Qty ${item.quantity} · ${item.status}` })), meta: result.meta };
    },
  });
  const columns: ColumnDef<Reference>[] = [
    { accessorKey: 'name', header: title }, { accessorKey: 'description', header: 'Informasi' },
    { id: 'select', header: 'Aksi', cell: ({ row }) => <Button type="button" size="sm" onClick={() => { onChange(row.original); setOpen(false); }}>{row.original.id === value?.id ? 'Terpilih' : 'Pilih'}</Button> },
  ];
  return <div className="flex min-w-0 gap-1"><Button type="button" variant="secondary" className="h-11 min-w-0 flex-1 justify-between font-normal" aria-label={`Pilih ${title}`} onClick={() => { setQ(''); setPage(1); setOpen(true); }}><span className="truncate">{value?.name ?? `Pilih ${title}`}</span><Search className="h-4 w-4 shrink-0" /></Button>{value && <Button type="button" variant="ghost" className="h-11 w-9 shrink-0 p-0" aria-label={`Hapus pilihan ${title}`} onClick={() => onChange(null)}><X className="h-4 w-4" /></Button>}
    <Modal open={open} title={`Pilih ${title}`} description={`Cari dan pilih ${title.toLowerCase()} untuk penerimaan hasil produksi.`} pending={false} onClose={() => setOpen(false)}><Input autoFocus aria-label={`Cari ${title}`} placeholder={`Cari nomor / nama ${title}...`} value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} className="mb-4" /><DataTable data={query.data?.items ?? []} columns={columns} loading={query.isPending} error={query.error} retry={() => void query.refetch()} /><div className="mt-4 flex items-center justify-between gap-2 text-xs text-text"><span>Halaman {page}</span><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</Button><Button type="button" size="sm" variant="secondary" disabled={!query.data || (!query.data.meta.hasNextPage && page >= query.data.meta.lastPage) || query.isFetching} onClick={() => setPage(page + 1)}>Selanjutnya</Button></div></div></Modal>
  </div>;
}

function ReceiptBadge({ status }: { status: ReceiptStatus }) {
  return <Badge variant={status === 'received' ? 'success' : status === 'cancelled' ? 'danger' : 'warning'}>{status}</Badge>;
}

function CreateReceiptDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const refresh = useRefreshProduction();
  const [warehouse, setWarehouse] = useState<Reference | null>(null);
  const [items, setItems] = useState([{ key: crypto.randomUUID(), workOrder: null as Reference | null, good: '0', reject: '0' }]);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<FinishedGoodsReceiptInput | null>(null);
  const mutation = useMutation({ mutationFn: service.create, onSuccess: async (receipt) => {
    await refresh(); toast.success('Penerimaan hasil produksi berhasil dibuat'); onClose(); navigate(`${base}/${receipt.id}`);
  }, onError: (failure) => setError(message(failure)) });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending || confirmation) return;
    const parsed = finishedGoodsReceiptInputSchema.safeParse({ ...Object.fromEntries(new FormData(event.currentTarget)), warehouse_id: warehouse?.id ?? '', items: items.map((item) => ({ work_order_id: item.workOrder?.id ?? '', qty_good: item.good, qty_reject: item.reject })) });
    if (!parsed.success) { setError(message(parsed.error)); return; }
    setError('');
    if (parsed.data.status === 'received') setConfirmation(parsed.data);
    else mutation.mutate(parsed.data);
  };
  return <Modal open title="Tambah Finished Goods Receipt" description="Catat hasil produksi berdasarkan SPK. Draft disimpan tanpa perubahan stok." pending={mutation.isPending} onClose={onClose}>
    <form onSubmit={submit} className="space-y-5"><fieldset disabled={mutation.isPending} className="grid gap-4 md:grid-cols-2">
      <Field label="Nomor FGR"><Input name="fgr_number" required placeholder="FGR-2026-001" /></Field>
      <Field label="Gudang"><ReferencePicker kind="warehouse" value={warehouse} onChange={setWarehouse} /></Field>
      <Field label="Tanggal penerimaan"><Input name="receipt_date" type="date" required defaultValue={new Date().toLocaleDateString('en-CA')} /></Field>
      <Field label="Status"><Select name="status" defaultValue="draft">{receiptStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select></Field>
      <Field label="Catatan"><textarea name="notes" className="w-full rounded-xl border border-border bg-surface-1 p-3 text-text-h" /></Field>
    </fieldset>
    <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-text-h">Hasil per SPK</h3><Button type="button" variant="secondary" size="sm" disabled={mutation.isPending} onClick={() => setItems([...items, { key: crypto.randomUUID(), workOrder: null, good: '0', reject: '0' }])}><Plus className="h-4 w-4" />Tambah Item</Button></div>
    <div className="space-y-3">{items.map((item) => <fieldset disabled={mutation.isPending} key={item.key} className="grid items-start gap-3 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
      <Field label="SPK"><ReferencePicker kind="work-order" value={item.workOrder} onChange={(value) => setItems((rows) => rows.map((row) => row.key === item.key ? { ...row, workOrder: value } : row))} />{item.workOrder && <p className="text-xs text-text">{item.workOrder.description}</p>}</Field>
      <Field label="Qty baik"><Input type="number" min="0" step="1" required value={item.good} onChange={(event) => setItems((rows) => rows.map((row) => row.key === item.key ? { ...row, good: event.target.value } : row))} /></Field>
      <Field label="Qty reject"><Input type="number" min="0" step="1" required value={item.reject} onChange={(event) => setItems((rows) => rows.map((row) => row.key === item.key ? { ...row, reject: event.target.value } : row))} /></Field>
      <Button type="button" variant="ghost" size="sm" className="mt-7 text-rose-400" aria-label="Hapus item" disabled={items.length === 1 || mutation.isPending} onClick={() => setItems((rows) => rows.filter((row) => row.key !== item.key))}><Trash2 className="h-4 w-4" /></Button>
    </fieldset>)}</div>
    <p className="text-xs text-text">Produk dan ukuran tidak dikirim dari form; backend mengambilnya dari SPK yang dipilih.</p>
    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-text-h">{backflushingInfo}</p>
    {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-400">{error}</p>}
    <DialogFooter><Button type="button" variant="secondary" disabled={mutation.isPending} onClick={onClose}>Batal</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter>
    </form>
    <Modal open={!!confirmation} title="Konfirmasi Penerimaan Hasil Produksi" description={receivedEffect} pending={mutation.isPending} onClose={() => setConfirmation(null)}>
      {error && <p role="alert" className="mb-4 text-sm text-rose-400">{error}</p>}<DialogFooter><Button type="button" variant="secondary" disabled={mutation.isPending} onClick={() => setConfirmation(null)}>Batal</Button><Button type="button" disabled={mutation.isPending} onClick={() => { if (confirmation) mutation.mutate(confirmation); }}>{mutation.isPending ? 'Memproses...' : 'Ya, Terima Hasil Produksi'}</Button></DialogFooter>
    </Modal>
  </Modal>;
}

export function FinishedGoodsReceiptsPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [warehouse, setWarehouse] = useState<Reference | null>(null);
  const [workOrder, setWorkOrder] = useState<Reference | null>(null);
  const [search] = useDebounce(filters.q, 300);
  const queryFilters = { ...filters, q: search.trim() };
  const query = useQuery({ queryKey: ['production', 'finished-goods-receipts', page, queryFilters], queryFn: () => service.list(page, queryFilters) });
  const change = (key: keyof ReceiptFilters, value: string) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (next.date_from && next.date_to && next.date_from > next.date_to) {
        if (key === 'date_from') next.date_to = value;
        else next.date_from = value;
      }
      return next;
    });
    setPage(1);
  };
  const columns: ColumnDef<FinishedGoodsReceipt>[] = [
    { id: 'number', header: 'No', cell: ({ row }) => (page - 1) * (query.data?.per_page ?? 15) + row.index + 1 },
    { accessorKey: 'fgr_number', header: 'Nomor FGR', cell: ({ row }) => <Link className="font-semibold text-text-h hover:underline" to={`${base}/${row.original.id}`}>{row.original.fgr_number}</Link> },
    { id: 'warehouse', header: 'Gudang', cell: ({ row }) => row.original.warehouse?.name ?? row.original.warehouse_id },
    { accessorKey: 'receipt_date', header: 'Tanggal', cell: ({ row }) => row.original.receipt_date.slice(0, 10) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <ReceiptBadge status={row.original.status} /> },
    { id: 'items', header: 'Item SPK', cell: ({ row }) => row.original.items?.length ?? '-' },
    { id: 'detail', header: 'Aksi', cell: ({ row }) => <Button asChild variant="secondary" size="sm"><Link to={`${base}/${row.original.id}`}>Detail</Link></Button> },
  ];
  return <Card><CardHeader>
    <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/production">Production</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Finished Goods Receipts</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="space-y-1"><CardTitle>Finished Goods Receipts</CardTitle><CardDescription>Penerimaan hasil produksi dari SPK ke gudang barang jadi.</CardDescription></div><div className="flex gap-2"><Button type="button" variant="secondary" disabled={query.isFetching} onClick={() => void query.refetch()} aria-label="Muat ulang penerimaan"><RefreshCw className="h-4 w-4" /></Button><Button type="button" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Tambah</Button></div></div>
  </CardHeader><CardContent className="space-y-4">
    <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-2/40 p-4"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Field label="Cari FGR"><Input value={filters.q} placeholder="Nomor penerimaan..." onChange={(event) => change('q', event.target.value)} /></Field>
      <Field label="Status"><Select value={filters.status} onChange={(event) => change('status', event.target.value)}><option value="">Semua status</option>{receiptStatuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
      <Field label="Gudang"><ReferencePicker kind="warehouse" value={warehouse} onChange={(value) => { setWarehouse(value); change('warehouse_id', value?.id ?? ''); }} /></Field>
      <Field label="SPK"><ReferencePicker kind="work-order" value={workOrder} onChange={(value) => { setWorkOrder(value); change('work_order_id', value?.id ?? ''); }} /></Field>
      <Field label="Tanggal dari"><Input type="date" max={filters.date_to || undefined} value={filters.date_from} onChange={(event) => change('date_from', event.target.value)} /></Field>
      <Field label="Tanggal sampai"><Input type="date" min={filters.date_from || undefined} value={filters.date_to} onChange={(event) => change('date_to', event.target.value)} /></Field>
    </div><Button type="button" variant="secondary" size="sm" onClick={() => { setFilters(emptyFilters); setWarehouse(null); setWorkOrder(null); setPage(1); }}>Reset Filter</Button></div>
    <DataTable data={query.data?.data ?? []} columns={columns} loading={query.isPending} error={query.error} retry={() => void query.refetch()} />
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text"><span>{query.data?.total ?? 0} penerimaan</span><div className="flex items-center gap-3"><Button type="button" variant="secondary" size="sm" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</Button><span>Halaman {page} / {query.data?.last_page ?? 1}</span><Button type="button" variant="secondary" size="sm" disabled={!query.data || page >= query.data.last_page || query.isFetching} onClick={() => setPage(page + 1)}>Selanjutnya</Button></div></div>
    {createOpen && <CreateReceiptDialog onClose={() => setCreateOpen(false)} />}
  </CardContent></Card>;
}

type ReceiptAction = { type: 'delete' } | { type: 'status'; status: ReceiptStatus };
export function FinishedGoodsReceiptDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const refresh = useRefreshProduction();
  const [action, setAction] = useState<ReceiptAction | null>(null);
  const query = useQuery({ queryKey: ['production', 'finished-goods-receipt', id], queryFn: () => service.get(id), enabled: !!id });
  const mutation = useMutation({ mutationFn: async (pending: ReceiptAction) => {
    if (pending.type === 'delete') await service.remove(id);
    else await service.updateStatus(id, pending.status);
  }, onSuccess: async (_, pending) => {
    setAction(null);
    if (pending.type === 'delete') navigate(base);
    await refresh(); toast.success(pending.type === 'delete' ? 'Penerimaan berhasil dihapus' : 'Status penerimaan berhasil diperbarui');
  }, onError: (error) => toast.error(message(error)) });
  if (query.isPending) return <p>Memuat penerimaan hasil produksi...</p>;
  if (query.isError) return <div role="alert" className="space-y-3 text-rose-400"><p>{message(query.error)}</p><Button variant="secondary" onClick={() => void query.refetch()}>Coba lagi</Button> <Link to={base}>Kembali</Link></div>;
  const receipt = query.data;
  const itemColumns: ColumnDef<NonNullable<FinishedGoodsReceipt['items']>[number]>[] = [
    { id: 'work-order', header: 'SPK', cell: ({ row }) => row.original.work_order?.wo_number ?? row.original.workOrder?.wo_number ?? row.original.work_order_id },
    { id: 'product', header: 'Produk', cell: ({ row }) => row.original.product?.product_name ?? row.original.product_id },
    { accessorKey: 'size', header: 'Ukuran', cell: ({ row }) => row.original.size || '-' },
    { accessorKey: 'qty_good', header: 'Qty Baik', cell: ({ row }) => count(row.original.qty_good) },
    { accessorKey: 'qty_reject', header: 'Qty Reject', cell: ({ row }) => count(row.original.qty_reject) },
  ];
  const movements = receipt.stock_movements ?? receipt.stockMovements;
  const movementColumns: ColumnDef<StockMovement>[] = [
    { id: 'number', header: 'No', cell: ({ row }) => row.index + 1 },
    { id: 'product', header: 'Produk / Bahan Baku', cell: ({ row }) => row.original.product?.product_name ?? row.original.product?.name ?? row.original.product_name ?? row.original.m_products_id ?? row.original.product_id ?? '-' },
    { id: 'warehouse', header: 'Gudang', cell: ({ row }) => row.original.warehouse?.warehouse_name ?? row.original.warehouse?.name ?? row.original.warehouse_name ?? row.original.m_warehouses_id ?? row.original.warehouse_id ?? '-' },
    { accessorKey: 'type', header: 'Pergerakan', cell: ({ row }) => <Badge variant={row.original.type === 'in' ? 'success' : 'danger'}>{row.original.type === 'in' ? 'In (Masuk)' : 'Out (Keluar)'}</Badge> },
    { accessorKey: 'quantity', header: 'Quantity', cell: ({ row }) => count(row.original.quantity) },
    { id: 'unit', header: 'Unit', cell: ({ row }) => row.original.product?.unit || '-' },
    { accessorKey: 'description', header: 'Keterangan', cell: ({ row }) => row.original.description || '-' },
    { id: 'detail', header: 'Aksi', cell: ({ row }) => <Button asChild variant="secondary" size="sm"><Link to={`/inventory/stock-movements/${row.original.id}`}>Detail</Link></Button> },
  ];
  const targets: ReceiptStatus[] = receipt.status === 'draft' ? ['received', 'cancelled'] : receipt.status === 'received' ? ['draft', 'cancelled'] : ['draft'];
  const effect = receipt.status === 'received' ? rollbackEffect : action?.type === 'status' && action.status === 'received' ? receivedEffect : 'Perubahan ini akan disimpan oleh backend. Pastikan dokumen yang dipilih sudah benar.';
  return <Card><CardHeader><Link to={base}>Kembali ke Finished Goods Receipts</Link><CardTitle>{receipt.fgr_number}</CardTitle><CardDescription>Detail penerimaan hasil produksi.</CardDescription></CardHeader><CardContent className="space-y-5">
    <ReceiptBadge status={receipt.status} />
    <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-text">Gudang</dt><dd className="font-semibold text-text-h">{receipt.warehouse?.name ?? receipt.warehouse_id}</dd></div><div><dt className="text-sm text-text">Tanggal</dt><dd className="text-text-h">{receipt.receipt_date.slice(0, 10)}</dd></div><div><dt className="text-sm text-text">Catatan</dt><dd className="whitespace-pre-wrap text-text-h">{receipt.notes || '-'}</dd></div></dl>
    <DataTable data={receipt.items ?? []} columns={itemColumns} loading={false} retry={() => void query.refetch()} />
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-text-h">Pergerakan Stok & Backflushing</h3><Button type="button" variant="secondary" size="sm" disabled={query.isFetching || mutation.isPending} onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />Muat Ulang</Button></div>
      <p className="text-sm text-text">{backflushingInfo} Rincian di bawah mengikuti pergerakan stok yang dikembalikan backend, tanpa perhitungan ulang di frontend.</p>
      {movements ? <DataTable<StockMovement> data={movements} columns={movementColumns} loading={query.isFetching} retry={() => void query.refetch()} /> : <p className="rounded-xl border border-border p-4 text-sm text-text">Respons detail belum menyertakan pergerakan stok. Periksa melalui <Link className="font-semibold text-accent hover:underline" to="/inventory/stock-movements">Inventory → Stock Movement</Link>.</p>}
    </section>
    <p className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-text">{receipt.status === 'received' ? rollbackEffect : receivedEffect}</p>
    <div className="flex flex-wrap gap-3">{targets.map((status) => <Button key={status} type="button" variant="secondary" disabled={mutation.isPending || query.isFetching} onClick={() => { mutation.reset(); setAction({ type: 'status', status }); }}>{status === 'received' ? 'Terima Hasil Produksi' : status === 'draft' ? 'Kembalikan ke Draft' : 'Batalkan Penerimaan'}</Button>)}<Button type="button" variant="destructive" disabled={mutation.isPending || query.isFetching} onClick={() => { mutation.reset(); setAction({ type: 'delete' }); }}>Hapus</Button></div>
    <Modal open={!!action} title={action?.type === 'delete' ? 'Hapus Penerimaan Hasil Produksi' : 'Konfirmasi Perubahan Status'} description={`${action?.type === 'delete' ? `Hapus ${receipt.fgr_number}? ` : `Ubah ${receipt.fgr_number} menjadi ${action?.type === 'status' ? action.status : ''}? `}${effect}`} pending={mutation.isPending} onClose={() => setAction(null)}>
      {mutation.isError && <p role="alert" className="mb-4 text-sm text-rose-400">{message(mutation.error)}</p>}<DialogFooter><Button type="button" variant="secondary" disabled={mutation.isPending} onClick={() => setAction(null)}>Batal</Button><Button type="button" variant={action?.type === 'delete' ? 'destructive' : 'default'} disabled={mutation.isPending} onClick={() => { if (action) mutation.mutate(action); }}>{mutation.isPending ? 'Memproses...' : 'Ya, Lanjutkan'}</Button></DialogFooter>
    </Modal>
  </CardContent></Card>;
}
