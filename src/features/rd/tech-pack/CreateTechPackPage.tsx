import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { useProducts } from '../../masterdata/items/hooks/useProducts';
import { useUnits } from '../../masterdata/units/hooks/useUnits';
import api from '../../../lib/api';
import { techPackService } from './techPack.service';
import type { TechPackPayload } from './techPack.types';

const optionalNumber = z.union([z.literal(''), z.coerce.number().min(0)]).optional();

const createTechPackSchema = z.object({
  name: z.string().trim().min(1, 'Nama tech pack wajib diisi').max(255),
  product_id: z.string().min(1, 'Produk wajib dipilih'),
  fabric: z.string().trim().optional(),
  gsm: optionalNumber,
  thread: z.string().trim().optional(),
  zipper: z.string().trim().optional(),
  accessories_text: z.string().optional(),
  status: z.enum(['draft', 'review', 'approved']),
  size_charts: z.array(z.object({
    size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
    body_length: optionalNumber,
    chest_width: optionalNumber,
    sleeve_length: optionalNumber,
    shoulder_width: optionalNumber,
  })),
  bom_items: z.array(z.object({
    material_product_id: z.string().min(1, 'Material wajib dipilih'),
    usage: z.coerce.number().gt(0, 'Pemakaian harus lebih dari 0'),
    unit_id: z.string().min(1, 'Satuan wajib dipilih'),
    cost_per_unit: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  })),
  costing: z.object({
    printing_cost: z.coerce.number().min(0),
    sewing_cost: z.coerce.number().min(0),
    additional_cost: z.coerce.number().min(0),
    margin_type: z.enum(['nominal', 'percentage']),
    margin: z.coerce.number().min(0),
  }),
}).superRefine((data, context) => {
  if (data.costing.margin_type === 'percentage' && data.costing.margin > 100) {
    context.addIssue({ code: 'custom', path: ['costing', 'margin'], message: 'Margin persentase maksimal 100' });
  }
});

type TechPackFormInput = z.input<typeof createTechPackSchema>;
type TechPackFormValues = z.output<typeof createTechPackSchema>;

interface SizeChartReference {
  id: string;
  product_id: string;
  product?: { id: string; product_name: string } | null;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  body_length?: number | null;
  chest_width?: number | null;
  sleeve_length?: number | null;
  shoulder_width?: number | null;
}

interface SizeChartResponse {
  data: SizeChartReference[] | { data: SizeChartReference[] };
}

const numberOrUndefined = (value: number | '' | undefined) => value === '' || value === undefined ? undefined : Number(value);

export function CreateTechPackPage() {
  const navigate = useNavigate();
  const [isSizeChartModalOpen, setIsSizeChartModalOpen] = useState(false);
  const [activeBomIndex, setActiveBomIndex] = useState<number | null>(null);
  const [materialSearch, setMaterialSearch] = useState('');
  const productsQuery = useProducts({ page: 1, perPage: 1000 });
  const unitsQuery = useUnits({ page: 1, perPage: 1000 });
  const products = productsQuery.data?.items ?? [];
  const units = unitsQuery.data?.items ?? [];
  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<TechPackFormInput, unknown, TechPackFormValues>({
    resolver: zodResolver(createTechPackSchema),
    defaultValues: {
      name: '', product_id: '', fabric: '', gsm: '', thread: '', zipper: '', accessories_text: '', status: 'draft',
      size_charts: [], bom_items: [],
      costing: { printing_cost: 0, sewing_cost: 0, additional_cost: 0, margin_type: 'percentage', margin: 0 },
    },
  });
  const sizeCharts = useFieldArray({ control, name: 'size_charts' });
  const bomItems = useFieldArray({ control, name: 'bom_items' });
  const marginType = watch('costing.margin_type');
  const productId = watch('product_id');
  const watchedBomItems = watch('bom_items');
  const filteredMaterials = products.filter((product) => product.product_name.toLowerCase().includes(materialSearch.trim().toLowerCase()));
  const sizeChartQuery = useQuery({
    queryKey: ['masterdata', 'size-charts', productId],
    queryFn: async () => {
      const response = await api.get<SizeChartResponse>('/master-data/size-charts', { params: productId ? { product_id: productId, per_page: 100 } : { per_page: 100 } });
      const payload = response.data.data;
      return Array.isArray(payload) ? payload : payload.data;
    },
    enabled: isSizeChartModalOpen,
  });

  const selectSizeChart = (chart: SizeChartReference) => {
    const existingIndex = sizeCharts.fields.findIndex((field) => field.size === chart.size);
    const value = {
      size: chart.size,
      body_length: chart.body_length ?? '',
      chest_width: chart.chest_width ?? '',
      sleeve_length: chart.sleeve_length ?? '',
      shoulder_width: chart.shoulder_width ?? '',
    } as const;
    if (existingIndex >= 0) {
      sizeCharts.update(existingIndex, value);
    } else {
      sizeCharts.append(value);
    }
    toast.success(`Size ${chart.size} ditambahkan dari master data`);
  };

  const onSubmit = async (values: TechPackFormValues) => {
    const payload: TechPackPayload = {
      name: values.name,
      product_id: values.product_id,
      fabric: values.fabric || undefined,
      gsm: numberOrUndefined(values.gsm),
      thread: values.thread || undefined,
      zipper: values.zipper || undefined,
      accessories: values.accessories_text?.split(',').map((item) => item.trim()).filter(Boolean),
      status: values.status,
      size_charts: values.size_charts.map((row) => ({
        size: row.size,
        body_length: numberOrUndefined(row.body_length),
        chest_width: numberOrUndefined(row.chest_width),
        sleeve_length: numberOrUndefined(row.sleeve_length),
        shoulder_width: numberOrUndefined(row.shoulder_width),
      })),
      bom_items: values.bom_items,
      costing: values.costing,
    };

    try {
      const created = await techPackService.create(payload);
      toast.success('Tech pack berhasil dibuat');
      navigate(`/rd/tech-packs?detail=${created.id}`);
    } catch {
      toast.error('Tech pack gagal dibuat. Periksa kembali data yang diisi.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/rd/tech-packs">Tech Pack</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Create</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
          <CardTitle className="text-2xl">Create Tech Pack</CardTitle>
          <CardDescription>Tambahkan spesifikasi produk, size chart, BOM, dan costing.</CardDescription>
        </CardHeader>
      </Card>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Card><CardHeader><CardTitle>Informasi Utama</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Tech Pack" error={errors.name?.message}><Input {...register('name')} placeholder="Hoodie Fleece Custom" /></Field>
          <Field label="Produk" error={errors.product_id?.message}><Select {...register('product_id')}><option value="">Pilih produk</option>{products.map((product) => <option key={product.id} value={String(product.id)}>{product.product_name}</option>)}</Select></Field>
          <Field label="Fabric"><Input {...register('fabric')} placeholder="Cotton Fleece" /></Field>
          <Field label="GSM" error={errors.gsm?.message}><Input type="number" min="0" {...register('gsm')} /></Field>
          <Field label="Thread"><Input {...register('thread')} placeholder="Polyester 30/2" /></Field>
          <Field label="Zipper"><Input {...register('zipper')} placeholder="YKK #5" /></Field>
          <Field label="Accessories (pisahkan dengan koma)"><Input {...register('accessories_text')} placeholder="drawcord, eyelet" /></Field>
          <Field label="Status"><Select {...register('status')}><option value="draft">Draft</option><option value="review">Review</option><option value="approved">Approved</option></Select></Field>
        </CardContent></Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><CardTitle>Size Chart</CardTitle><CardDescription>Ukuran dalam sentimeter.</CardDescription></div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setIsSizeChartModalOpen(true)}>Ambil dari Master Data</Button>
                <Button type="button" size="sm" onClick={() => sizeCharts.append({ size: 'M', body_length: '', chest_width: '', sleeve_length: '', shoulder_width: '' })}><Plus className="h-4 w-4" />Tambah Size</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden grid-cols-6 gap-3 px-3 text-xs font-semibold uppercase tracking-wide text-text md:grid"><span>Ukuran</span><span>Panjang Baju</span><span>Lebar Dada</span><span>Panjang Lengan</span><span>Lebar Bahu</span><span className="text-center">Aksi</span></div>
            {sizeCharts.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-6"><Select aria-label="Ukuran" {...register(`size_charts.${index}.size`)}><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option></Select><Input type="number" aria-label="Panjang baju" placeholder="Panjang baju" {...register(`size_charts.${index}.body_length`)} /><Input type="number" aria-label="Lebar dada" placeholder="Lebar dada" {...register(`size_charts.${index}.chest_width`)} /><Input type="number" aria-label="Panjang lengan" placeholder="Panjang lengan" {...register(`size_charts.${index}.sleeve_length`)} /><Input type="number" aria-label="Lebar bahu" placeholder="Lebar bahu" {...register(`size_charts.${index}.shoulder_width`)} /><Button type="button" variant="destructive" onClick={() => sizeCharts.remove(index)}><Trash2 className="h-4 w-4" />Hapus</Button></div>)}
            {sizeCharts.fields.length === 0 && <p className="text-sm text-text">Size chart bersifat opsional.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Bill of Materials</CardTitle><CardDescription>Backend akan menghitung total setiap material.</CardDescription></div><Button type="button" size="sm" onClick={() => bomItems.append({ material_product_id: '', usage: 1, unit_id: '', cost_per_unit: 0 })}><Plus className="h-4 w-4" />Tambah Material</Button></div></CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden grid-cols-5 gap-3 px-3 text-xs font-semibold uppercase tracking-wide text-text md:grid"><span>Material</span><span>Pemakaian</span><span>Satuan</span><span>Harga / Unit</span><span className="text-center">Aksi</span></div>
            {bomItems.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-5"><div className="flex gap-2"><input type="hidden" {...register(`bom_items.${index}.material_product_id`)} /><Input readOnly value={products.find((product) => String(product.id) === watchedBomItems?.[index]?.material_product_id)?.product_name ?? ''} placeholder="Pilih material" /><Button type="button" variant="secondary" onClick={() => setActiveBomIndex(index)}>Pilih</Button></div><Input type="number" min="0.0001" step="0.0001" aria-label="Pemakaian" placeholder="Pemakaian" {...register(`bom_items.${index}.usage`)} /><Select aria-label="Satuan" {...register(`bom_items.${index}.unit_id`)}><option value="">Pilih satuan</option>{units.map((unit) => <option key={unit.id} value={String(unit.id)}>{unit.unit_name} ({unit.unit_code})</option>)}</Select><Input type="number" min="0" aria-label="Harga per unit" placeholder="Harga per unit" {...register(`bom_items.${index}.cost_per_unit`)} /><Button type="button" variant="destructive" onClick={() => bomItems.remove(index)}><Trash2 className="h-4 w-4" />Hapus</Button></div>)}
            {bomItems.fields.length === 0 && <p className="text-sm text-text">Tambahkan material untuk menghitung material cost.</p>}
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle>Costing</CardTitle><CardDescription>Material cost, HPP, dan harga jual dihitung oleh backend.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Printing / Bordir"><Input type="number" min="0" {...register('costing.printing_cost')} /></Field>
          <Field label="Ongkos Jahit"><Input type="number" min="0" {...register('costing.sewing_cost')} /></Field>
          <Field label="Biaya Tambahan"><Input type="number" min="0" {...register('costing.additional_cost')} /></Field>
          <Field label="Jenis Margin"><Select {...register('costing.margin_type')}><option value="percentage">Persentase</option><option value="nominal">Nominal</option></Select></Field>
          <Field label={marginType === 'percentage' ? 'Margin (%)' : 'Margin (Rp)'} error={errors.costing?.margin?.message}><Input type="number" min="0" max={marginType === 'percentage' ? 100 : undefined} {...register('costing.margin')} /></Field>
        </CardContent></Card>

        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" asChild><Link to="/rd/tech-packs">Batal</Link></Button><Button type="submit" disabled={isSubmitting || productsQuery.isLoading || unitsQuery.isLoading}>{isSubmitting ? 'Menyimpan...' : 'Simpan Tech Pack'}</Button></div>
      </form>

      <Dialog open={isSizeChartModalOpen} onOpenChange={setIsSizeChartModalOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pilih Size Chart Master Data</DialogTitle>
            <DialogDescription>Pilih ukuran yang akan disalin ke Tech Pack. Ukuran yang sama akan diperbarui.</DialogDescription>
          </DialogHeader>
          {sizeChartQuery.isLoading && <p className="text-sm text-text">Memuat size chart...</p>}
          {sizeChartQuery.isError && <p className="text-sm text-rose-400">Size chart gagal dimuat.</p>}
          {!sizeChartQuery.isLoading && !sizeChartQuery.isError && (sizeChartQuery.data ?? []).length === 0 && <p className="text-sm text-text">Belum ada size chart di master data{productId ? ' untuk produk yang dipilih' : ''}.</p>}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2"><tr><th className="px-3 py-2">Produk</th><th className="px-3 py-2">Ukuran</th><th className="px-3 py-2">Panjang Baju</th><th className="px-3 py-2">Lebar Dada</th><th className="px-3 py-2">Panjang Lengan</th><th className="px-3 py-2">Lebar Bahu</th><th className="px-3 py-2">Aksi</th></tr></thead>
              <tbody className="divide-y divide-border">{(sizeChartQuery.data ?? []).map((chart) => <tr key={chart.id}><td className="px-3 py-2">{chart.product?.product_name ?? chart.product_id}</td><td className="px-3 py-2 font-semibold">{chart.size}</td><td className="px-3 py-2">{chart.body_length ?? '-'}</td><td className="px-3 py-2">{chart.chest_width ?? '-'}</td><td className="px-3 py-2">{chart.sleeve_length ?? '-'}</td><td className="px-3 py-2">{chart.shoulder_width ?? '-'}</td><td className="px-3 py-2"><Button type="button" size="sm" onClick={() => selectSizeChart(chart)}>Pilih</Button></td></tr>)}</tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeBomIndex !== null} onOpenChange={(open) => { if (!open) { setActiveBomIndex(null); setMaterialSearch(''); } }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pilih Material Master Data</DialogTitle>
            <DialogDescription>Pilih produk atau bahan baku yang akan digunakan sebagai material BOM.</DialogDescription>
          </DialogHeader>
          <Input value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} placeholder="Cari nama material..." autoFocus />
          {productsQuery.isLoading && <p className="text-sm text-text">Memuat material...</p>}
          {productsQuery.isError && <p className="text-sm text-rose-400">Material gagal dimuat.</p>}
          {!productsQuery.isLoading && filteredMaterials.length === 0 && <p className="text-sm text-text">Material tidak ditemukan.</p>}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2"><tr><th className="px-4 py-3">Nama Material</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Satuan</th><th className="px-4 py-3">Aksi</th></tr></thead>
              <tbody className="divide-y divide-border">{filteredMaterials.map((product) => <tr key={product.id}><td className="px-4 py-3 font-medium text-text-h">{product.product_name}</td><td className="px-4 py-3 text-text">{product.category?.category_name ?? '-'}</td><td className="px-4 py-3 text-text">{product.unit?.unit_name ?? '-'}</td><td className="px-4 py-3"><Button type="button" size="sm" onClick={() => { if (activeBomIndex === null) return; setValue(`bom_items.${activeBomIndex}.material_product_id`, String(product.id), { shouldDirty: true, shouldValidate: true }); if (product.unit_id) setValue(`bom_items.${activeBomIndex}.unit_id`, String(product.unit_id), { shouldDirty: true, shouldValidate: true }); setActiveBomIndex(null); setMaterialSearch(''); }}>Pilih</Button></td></tr>)}</tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm text-rose-400">{error}</p>}</div>;
}
