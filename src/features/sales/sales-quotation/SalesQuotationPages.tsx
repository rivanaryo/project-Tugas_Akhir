'use no memo';

import { useState, type FormEvent, type ReactNode } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Search, RotateCcw, X } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { customerService } from '../../masterdata/customers/services/customerService';
import { productService } from '../../masterdata/items/services/productService';
import { sizeChartService } from '../../masterdata/size-charts/services/sizeChartService';
import { salesQuotationService as service } from './salesQuotation.service';
import {
  quotationStatuses, quotationHeadInputSchema, quotationItemInputSchema,
  type Quotation, type QuotationItem, type QuotationFilters, type QuotationHeadInput, type QuotationItemInput,
} from './salesQuotation.schemas';

const base = '/sales/sales-quotations';
const emptyFilters: QuotationFilters = { q: '', status: '', customer_id: '', quotation_date_from: '', quotation_date_to: '' };
const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
const date = (value?: string | null) => value?.slice(0, 10) ?? '';
const controlClass = 'w-full rounded-xl border border-border bg-surface-1 p-3 text-text-h';

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues.map((issue) => issue.message).join('; ');
  if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
    const body = error.response?.data;
    return body?.errors ? Object.values(body.errors).flat().join('; ') : body?.message ?? 'Gagal menghubungi server';
  }
  return 'Gagal memproses sales quotation';
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <fieldset className="min-w-0 space-y-2 text-sm text-text-h"><legend className="mb-2 font-medium">{label}</legend>{children}</fieldset>;
}

function ReferenceModalPicker({ kind = 'customer', value, label, onChange }: { kind?: 'customer' | 'product'; value: string; label?: string; onChange: (value: string) => void }) {
  const title = kind === 'customer' ? 'Customer' : 'Produk';
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ id: string; name: string }>();
  const [search] = useDebounce(q, 300);
  const query = useQuery({
    queryKey: ['quotation-reference-picker', kind, search, page],
    queryFn: async () => {
      if (kind === 'customer') {
        const result = await customerService.fetchCustomers(page, 10, { q: search });
        return { meta: result.meta, items: result.items.map((item) => ({ id: String(item.id), name: item.customer_name, detail: item.contact_person || '-', extra: item.phone_number || '-' })) };
      }
      const result = await productService.fetchProducts(page, 10, { q: search });
      return { meta: result.meta, items: result.items.map((item) => ({ id: String(item.id), name: item.product_name, detail: item.category?.category_name || '-', extra: item.unit?.unit_name || '-' })) };
    },
    enabled: open,
  });
  const options = query.data?.items ?? [];
  const columns: ColumnDef<(typeof options)[number]>[] = [
    { accessorKey: 'name', header: title, cell: ({ row }) => <span className="font-semibold text-text-h">{row.original.name}</span> },
    { accessorKey: 'detail', header: kind === 'customer' ? 'Kontak' : 'Kategori' },
    { accessorKey: 'extra', header: kind === 'customer' ? 'Telepon' : 'Satuan' },
    { id: 'actions', header: 'Pilih', cell: ({ row }) => <Button type="button" size="sm" variant={value === row.original.id ? 'secondary' : 'default'} onClick={() => {
      setSelected({ id: row.original.id, name: row.original.name });
      onChange(row.original.id); setOpen(false);
    }}>{value === row.original.id ? 'Terpilih' : 'Pilih'}</Button> },
  ];
  const selectedName = value ? (selected?.id === value ? selected.name : label || value) : '';
  return <div className="flex min-w-0 gap-2">
    <Button type="button" variant="secondary" className="h-11 min-w-0 flex-1 justify-between font-normal" aria-label={selectedName ? `Ganti ${title} ${selectedName}` : `Pilih ${title}`} onClick={() => { setQ(''); setPage(1); setOpen(true); }}>
      <span className="truncate">{selectedName || `Pilih ${title}`}</span><Search className="h-4 w-4 shrink-0" />
    </Button>
    {value && <Button type="button" variant="ghost" className="h-11 w-9 shrink-0 p-0" aria-label={`Hapus pilihan ${title}`} onClick={() => onChange('')}><X className="h-4 w-4" /></Button>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader className="mb-4"><DialogTitle>Pilih {title}</DialogTitle><DialogDescription>Cari {title.toLowerCase()} lalu klik Pilih untuk menggunakan data tersebut.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text" /><Input autoFocus className="pl-9" aria-label={`Cari ${title}`} placeholder={`Cari nama ${title.toLowerCase()}...`} value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} /></div>
          <QuotationTable data={options} columns={columns} loading={query.isPending} error={query.error} onRetry={() => void query.refetch()} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text">
            <span>{query.isFetching ? 'Memuat...' : `${query.data?.meta.total ?? 0} ${title.toLowerCase()} · Halaman ${page}`}</span>
            <div className="flex gap-2"><Button type="button" variant="secondary" size="sm" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</Button><Button type="button" variant="secondary" size="sm" disabled={!query.data?.meta.hasNextPage || query.isFetching} onClick={() => setPage(page + 1)}>Berikutnya</Button></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}

function QuotationTable<T extends { id: string }>({ data, columns, loading, error, onRetry }: {
  data: T[]; columns: ColumnDef<T>[]; loading: boolean; error: unknown; onRetry: () => void;
}) {
  'use no memo';
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id });
  return <div className="rounded-xl border border-border/80"><div className="max-h-[60vh] overflow-auto">
    <table className="min-w-140 w-full border-collapse text-left text-sm">
      <thead className="sticky top-0 z-10 bg-surface-2">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="table-head px-4 py-3 font-semibold text-text-h">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
      <tbody className="bg-surface-1">{loading ? Array.from({ length: 6 }, (_, index) => <tr key={index} className="border-t border-border/80">{columns.map((_, cell) => <td key={cell} className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>)}</tr>) : error ? <tr><td colSpan={columns.length} className="px-4 py-5 text-rose-400" role="alert">{errorMessage(error)} <Button variant="secondary" size="sm" onClick={onRetry}>Coba lagi</Button></td></tr> : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t border-border/80 hover:bg-surface-2/70">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 text-[14px] text-text">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-5 text-text">Tidak ada data.</td></tr>}</tbody>
    </table>
  </div></div>;
}

function FormModal({ open, title, description, pending, onClose, children }: {
  open: boolean; title: string; description: string; pending: boolean; onClose: () => void; children: ReactNode;
}) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next && !pending) onClose(); }}>
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" onEscapeKeyDown={(event) => { if (pending) event.preventDefault(); }} onPointerDownOutside={(event) => { if (pending) event.preventDefault(); }}>
      <DialogHeader className="mb-5"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      {children}
    </DialogContent>
  </Dialog>;
}

function HeadDialog({ open, quotation, onClose }: { open: boolean; quotation?: Quotation; onClose: () => void }) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: QuotationHeadInput) => quotation ? service.update(quotation.id, input) : service.create(input),
    onSuccess: async (result) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['sales-quotations'] }),
        client.invalidateQueries({ queryKey: ['sales-quotation', result.id] }),
      ]);
      toast.success(quotation ? 'Quotation berhasil diperbarui' : 'Quotation berhasil dibuat');
      onClose();
      if (!quotation) navigate(`${base}/${result.id}`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  return <FormModal open={open} title={quotation ? 'Edit Sales Quotation' : 'Tambah Sales Quotation'} description="Isi informasi penawaran pelanggan. Item dikelola pada halaman detail." pending={mutation.isPending} onClose={onClose}>
    <HeadForm quotation={quotation} pending={mutation.isPending} onSave={(input) => mutation.mutate(input)} onCancel={onClose} />
  </FormModal>;
}

export function SalesQuotationsPage({ initialCreate = false }: { initialCreate?: boolean }) {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(initialCreate);
  const [editingQuotation, setEditingQuotation] = useState<Quotation>();
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [search] = useDebounce(filters.q, 300);
  const queryFilters = { ...filters, q: search };
  const query = useQuery({ queryKey: ['sales-quotations', page, queryFilters], queryFn: () => service.list(page, queryFilters) });
  const change = (key: keyof QuotationFilters, value: string) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (next.quotation_date_from && next.quotation_date_to && next.quotation_date_from > next.quotation_date_to) {
        if (key === 'quotation_date_from') next.quotation_date_to = value;
        else next.quotation_date_from = value;
      }
      return next;
    });
    setPage(1);
  };
  const columns: ColumnDef<Quotation>[] = [
    { id: 'number', header: 'No', cell: ({ row }) => <span className="metric-number font-semibold text-text-h">{(page - 1) * 15 + row.index + 1}</span> },
    { accessorKey: 'quotation_number', header: 'Quotation Number', cell: ({ row }) => <Link className="font-semibold text-text-h hover:underline" to={`${base}/${row.original.id}`}>{row.original.quotation_number}</Link> },
    { id: 'customer', header: 'Customer', cell: ({ row }) => row.original.customer?.customer_name ?? '-' },
    { accessorKey: 'quotation_date', header: 'Tanggal', cell: ({ row }) => date(row.original.quotation_date) || '-' },
    { accessorKey: 'valid_until', header: 'Berlaku sampai', cell: ({ row }) => date(row.original.valid_until) || '-' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'accepted' ? 'success' : row.original.status === 'sent' ? 'info' : ['rejected', 'cancelled'].includes(row.original.status) ? 'danger' : row.original.status === 'expired' ? 'warning' : 'default'}>{row.original.status}</Badge> },
    { accessorKey: 'grand_total', header: () => <div className="text-right">Grand Total</div>, cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{currency(row.original.grand_total)}</div> },
    { id: 'actions', header: () => <div className="text-right">Actions</div>, cell: ({ row }) => <div className="flex justify-end gap-1.5">
      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0"><Link to={`${base}/${row.original.id}`} aria-label={`Detail ${row.original.quotation_number}`}><Eye className="h-4 w-4 text-blue-400" /></Link></Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Edit ${row.original.quotation_number}`} onClick={() => setEditingQuotation(row.original)}><Pencil className="h-4 w-4" /></Button>
    </div> },
  ];
  const closeCreate = () => { setShowCreate(false); if (initialCreate) navigate(base, { replace: true }); };
  return <Card>
    <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Sales Quotations</CardTitle><Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" />Tambah Quotation</Button></div></CardHeader>
    <CardContent className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-2/40 p-4">
        <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="sm:col-span-2"><Field label="Cari quotation"><div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text" /><Input className="h-11 pl-9" aria-label="Cari quotation" value={filters.q} onChange={(event) => change('q', event.target.value)} placeholder="Cari nomor quotation..." /></div></Field></div>
          <Field label="Status"><Select aria-label="Filter status" value={filters.status} onChange={(event) => change('status', event.target.value)}><option value="">Semua status</option>{quotationStatuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</Select></Field>
          <Field label="Customer"><ReferenceModalPicker value={filters.customer_id} onChange={(value) => change('customer_id', value)} /></Field>
          <Field label="Tanggal dari"><Input aria-label="Tanggal quotation dari" type="date" value={filters.quotation_date_from} onChange={(event) => change('quotation_date_from', event.target.value)} /></Field>
          <Field label="Tanggal sampai"><Input aria-label="Tanggal quotation sampai" type="date" min={filters.quotation_date_from} value={filters.quotation_date_to} onChange={(event) => change('quotation_date_to', event.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p className="text-xs text-text" role="status">{query.isFetching ? 'Memuat quotation...' : 'Filter diterapkan otomatis. Rentang tanggal berdasarkan tanggal quotation.'}</p>
          <Button type="button" variant="secondary" size="sm" disabled={!Object.values(filters).some(Boolean)} onClick={() => { setFilters(emptyFilters); setPage(1); }}><RotateCcw className="h-3.5 w-3.5" />Reset Filter</Button>
        </div>
      </div>
      <QuotationTable data={query.data?.data ?? []} columns={columns} loading={query.isPending} error={query.error} onRetry={() => void query.refetch()} />
      <div className="flex flex-wrap items-center gap-3"><Button variant="secondary" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</Button><span>Halaman {page} · {query.data?.total ?? 0} quotation</span><Button variant="secondary" disabled={!query.data || page * 15 >= query.data.total || query.isFetching} onClick={() => setPage(page + 1)}>Berikutnya</Button></div>
      <HeadDialog open={showCreate} onClose={closeCreate} />
      {editingQuotation && <HeadDialog open quotation={editingQuotation} onClose={() => setEditingQuotation(undefined)} />}
    </CardContent>
  </Card>;
}

function HeadForm({ quotation, pending, onSave, onCancel }: { quotation?: Quotation; pending: boolean; onSave: (input: QuotationHeadInput) => void; onCancel: () => void }) {
  const [customerId, setCustomerId] = useState(quotation?.customer_id ?? '');
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = quotationHeadInputSchema.safeParse({ ...values, customer_id: customerId });
    if (!parsed.success) { setError(errorMessage(parsed.error)); return; }
    setError('');
    onSave(parsed.data);
  };
  return <form onSubmit={submit} className="space-y-4">
    <fieldset disabled={pending} className="grid gap-4 md:grid-cols-2">
      <Field label="Nomor quotation"><Input name="quotation_number" required defaultValue={quotation?.quotation_number} /></Field>
      <Field label="Customer"><ReferenceModalPicker value={customerId} label={quotation?.customer?.customer_name} onChange={setCustomerId} /></Field>
      <Field label="Tanggal quotation"><Input name="quotation_date" type="date" required defaultValue={date(quotation?.quotation_date) || new Date().toLocaleDateString('en-CA')} /></Field>
      <Field label="Berlaku sampai"><Input name="valid_until" type="date" defaultValue={date(quotation?.valid_until)} /></Field>
      <Field label="Status"><Select name="status" defaultValue={quotation?.status ?? 'draft'}>{quotationStatuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
      <Field label="Catatan"><textarea name="notes" className={controlClass} defaultValue={quotation?.notes ?? ''} /></Field>
    </fieldset>
    {error && <p role="alert" className="text-red-500">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>Batal</Button><Button type="submit" disabled={pending}>{pending ? 'Menyimpan...' : 'Simpan Quotation'}</Button></div>
    {!quotation && <p className="text-sm text-text">Simpan quotation terlebih dahulu, lalu tambahkan item pada halaman detail.</p>}
  </form>;
}

function ItemForm({ item, pending, onSave, onCancel }: { item?: QuotationItem; pending: boolean; onSave: (input: QuotationItemInput) => void; onCancel: () => void }) {
  const [productId, setProductId] = useState(item?.product_id ?? '');
  const [size, setSize] = useState(item?.size ?? '');
  const sizes = useQuery({
    queryKey: ['quotation-product-sizes', productId],
    queryFn: () => sizeChartService.fetchSizeCharts(1, 100, { product_id: productId }),
    enabled: !!productId,
  });
  const availableSizes = [...new Set((sizes.data?.items ?? []).filter((chart) => String(chart.product_id) === productId).map((chart) => chart.size))];
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!availableSizes.includes(size as (typeof availableSizes)[number])) { setError('Pilih ukuran yang terdaftar pada size chart produk'); return; }
    const parsed = quotationItemInputSchema.safeParse({ ...Object.fromEntries(new FormData(event.currentTarget)), product_id: productId, size });
    if (!parsed.success) { setError(errorMessage(parsed.error)); return; }
    setError(''); onSave(parsed.data);
  };
  return <form onSubmit={submit} className="space-y-4">
    <fieldset disabled={pending} className="grid gap-4 md:grid-cols-2">
      <Field label="Produk"><ReferenceModalPicker kind="product" value={productId} label={item?.product?.product_name} onChange={(value) => { setProductId(value); setSize(''); }} /></Field>
      <Field label="Ukuran"><Select aria-label="Ukuran produk" required value={size} disabled={!productId || sizes.isFetching || sizes.isError} onChange={(event) => setSize(event.target.value)}>
        <option value="">{sizes.isFetching ? 'Memuat ukuran...' : 'Pilih ukuran'}</option>
        {size && !availableSizes.includes(size as (typeof availableSizes)[number]) && <option value={size} disabled>{size} (tidak tersedia)</option>}
        {availableSizes.map((value) => <option key={value} value={value}>{value}</option>)}
      </Select>
        {sizes.isError && <p role="alert" className="text-rose-400">Gagal memuat ukuran. <button type="button" onClick={() => void sizes.refetch()}>Coba lagi</button></p>}
        {productId && sizes.isSuccess && !availableSizes.length && <p className="text-xs text-text">Buat size chart untuk produk ini di Masterdata terlebih dahulu.</p>}
      </Field>
      <Field label="Quantity per ukuran"><Input name="quantity" type="number" min="1" step="1" required defaultValue={item?.quantity ?? 1} /></Field>
      <Field label="Harga satuan"><Input name="unit_price" type="number" min="0" step="any" required defaultValue={item?.unit_price ?? 0} /></Field>
      <Field label="Pajak (%)"><Input name="tax_rate" type="number" min="0" max="100" step="any" required defaultValue={item?.tax_rate ?? 0} /></Field>
    </fieldset>
    {error && <p role="alert" className="text-red-500">{error}</p>}
    <div className="flex gap-2"><Button disabled={pending} type="submit">{pending ? 'Menyimpan...' : 'Simpan Item'}</Button><Button disabled={pending} type="button" variant="secondary" onClick={onCancel}>Batal</Button></div>
  </form>;
}

export function CreateSalesQuotationPage() {
  return <SalesQuotationsPage initialCreate />;
}

export function SalesQuotationDetailPage({ edit = false }: { edit?: boolean }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [editingItem, setEditingItem] = useState<QuotationItem>();
  const [showItemForm, setShowItemForm] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const convert = useMutation({
    mutationFn: () => service.convertToOrder(id),
    onSuccess: async (order) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['sales-quotation', id] }),
        client.invalidateQueries({ queryKey: ['sales-quotations'] }),
        client.invalidateQueries({ queryKey: ['sales', 'sales-orders'] }),
      ]);
      client.setQueryData(['sales', 'sales-orders', 'detail', String(order.id)], order);
      setShowConvert(false);
      toast.success(`Quotation berhasil dikonversi menjadi ${order.order_number}`);
      navigate(`/sales/sales-orders/${order.id}`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const query = useQuery({ queryKey: ['sales-quotation', id], queryFn: () => service.get(id), enabled: !!id });
  const items = useQuery({ queryKey: ['sales-quotation-items', id], queryFn: () => service.items(id), enabled: !!id });
  const mutation = useMutation({
    mutationFn: async (operation: () => Promise<unknown>) => operation(),
    onSuccess: async () => {
      setShowItemForm(false); setEditingItem(undefined);
      await Promise.all([
        client.invalidateQueries({ queryKey: ['sales-quotation', id] }),
        client.invalidateQueries({ queryKey: ['sales-quotation-items', id] }),
        client.invalidateQueries({ queryKey: ['sales-quotations'] }),
      ]);
      toast.success('Perubahan berhasil disimpan');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({ mutationFn: () => service.remove(id), onSuccess: () => {
    void client.invalidateQueries({ queryKey: ['sales-quotations'] }); navigate(base); toast.success('Quotation berhasil dihapus');
  }, onError: (error) => toast.error(errorMessage(error)) });
  const busy = mutation.isPending || remove.isPending || convert.isPending;
  const itemColumns: ColumnDef<QuotationItem>[] = [
    { id: 'number', header: 'No', cell: ({ row }) => <span className="metric-number">{row.index + 1}</span> },
    { id: 'product', header: 'Produk', cell: ({ row }) => <span className="font-semibold text-text-h">{row.original.product?.product_name ?? row.original.product_id}</span> },
    { accessorKey: 'size', header: 'Ukuran' },
    { accessorKey: 'quantity', header: 'Qty per Ukuran' },
    { accessorKey: 'unit_price', header: 'Harga Satuan', cell: ({ row }) => currency(row.original.unit_price) },
    { accessorKey: 'tax_rate', header: 'Pajak (%)', cell: ({ row }) => row.original.tax_rate ?? 0 },
    { accessorKey: 'tax_amount', header: 'Pajak', cell: ({ row }) => currency(row.original.tax_amount) },
    { accessorKey: 'total_price', header: () => <div className="text-right">Total</div>, cell: ({ row }) => <div className="metric-number text-right font-semibold text-text-h">{currency(row.original.total_price)}</div> },
    { id: 'actions', header: () => <div className="text-right">Actions</div>, cell: ({ row }) => <div className="flex justify-end gap-2">
      <Button variant="secondary" size="sm" disabled={busy || showItemForm} onClick={() => { setEditingItem(row.original); setShowItemForm(true); }}><Pencil className="h-3 w-3" />Edit</Button>
      <Button variant="destructive" size="sm" disabled={busy || showItemForm} onClick={() => { if (window.confirm('Hapus item quotation ini?')) mutation.mutate(() => service.removeItem(id, row.original.id)); }}>Hapus</Button>
    </div> },
  ];
  if (query.isPending) return <p>Memuat quotation...</p>;
  if (query.isError) return <p role="alert">{errorMessage(query.error)} <Button onClick={() => void query.refetch()}>Coba lagi</Button> <Link to={base}>Kembali</Link></p>;
  const quotation = query.data;
  const conversionBlocked = ['rejected', 'expired', 'cancelled'].includes(quotation.status) ? `Quotation berstatus ${quotation.status} tidak bisa dikonversi.` : items.isPending || items.isError ? 'Tunggu hingga item berhasil dimuat.' : !items.data?.length ? 'Tambahkan item sebelum mengonversi quotation.' : '';
  return <div className="space-y-5"><Card>
    <CardHeader><Link to={base}>Kembali ke Sales Quotations</Link><CardTitle>{quotation.quotation_number}</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <dl className="grid gap-4 md:grid-cols-3">{[['Customer', quotation.customer?.customer_name ?? '-'], ['Tanggal', date(quotation.quotation_date) || '-'], ['Berlaku sampai', date(quotation.valid_until) || '-'], ['Status', quotation.status], ['Catatan', quotation.notes || '-']].map(([label, value]) => <div key={label}><dt className="text-sm text-text">{label}</dt><dd className="text-text-h">{value}</dd></div>)}</dl>
      <Button asChild variant="secondary"><Link to={`${base}/${id}/edit`}><Pencil className="h-4 w-4" />Edit Quotation</Link></Button>
      {edit && <HeadDialog open quotation={quotation} onClose={() => navigate(`${base}/${id}`, { replace: true })} />}
      <div className="grid gap-3 md:grid-cols-3">{[['Subtotal', quotation.subtotal], ['Total pajak', quotation.total_tax], ['Grand total', quotation.grand_total]].map(([label, value]) => <div key={label} className="rounded-xl bg-surface-2 p-4"><p className="text-sm text-text">{label}</p><p className="font-semibold text-text-h">{currency(Number(value))}</p></div>)}</div>
      <div className="flex flex-wrap gap-3"><Button disabled={busy || !!conversionBlocked || showItemForm || edit} onClick={() => setShowConvert(true)}>Konversi ke Sales Order</Button>
      <Button variant="destructive" disabled={busy} onClick={() => { if (window.confirm(`Hapus quotation ${quotation.quotation_number} beserta itemnya?`)) remove.mutate(); }}>Hapus Quotation</Button></div>
      {conversionBlocked && <p className="text-sm text-text">{conversionBlocked}</p>}
      <FormModal open={showConvert} title="Konversi ke Sales Order" description={`Customer, item per ukuran, dan total ${quotation.quotation_number} akan disalin. Nomor SO dibuat otomatis dan status quotation menjadi accepted.`} pending={convert.isPending} onClose={() => setShowConvert(false)}>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={convert.isPending} onClick={() => setShowConvert(false)}>Batal</Button><Button type="button" disabled={busy || !!conversionBlocked} onClick={() => convert.mutate()}>{convert.isPending ? 'Mengonversi...' : 'Konfirmasi Konversi'}</Button></div>
      </FormModal>
    </CardContent>
  </Card><Card><CardHeader><CardTitle>Item Quotation</CardTitle></CardHeader><CardContent className="space-y-4">
    <Button disabled={busy || showItemForm} onClick={() => { setEditingItem(undefined); setShowItemForm(true); }}><Plus className="h-4 w-4" />Tambah Item</Button>
    <FormModal open={showItemForm} title={editingItem ? 'Edit Item Quotation' : 'Tambah Item Quotation'} description="Pilih produk, quantity, harga satuan, dan pajak. Total dihitung oleh server." pending={busy} onClose={() => setShowItemForm(false)}>
      <ItemForm key={editingItem?.id ?? 'new'} item={editingItem} pending={busy} onCancel={() => setShowItemForm(false)} onSave={(input) => mutation.mutate(() => service.saveItem(id, input, editingItem?.id))} />
    </FormModal>
    <QuotationTable data={items.data ?? []} columns={itemColumns} loading={items.isPending} error={items.error} onRetry={() => void items.refetch()} />
  </CardContent></Card></div>;
}
