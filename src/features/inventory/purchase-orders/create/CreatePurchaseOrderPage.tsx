"use no memo";

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { useProducts } from '../../../masterdata/items/hooks/useProducts';
import { useUnits } from '../../../masterdata/units/hooks/useUnits';
import { useVendors } from '../../../masterdata/vendors/hooks/useVendors';
import { useCreatePurchaseOrder } from '../hooks/useCreatePurchaseOrder';
import { createPurchaseOrderFormSchema, type CreatePurchaseOrderFormInput } from '../schemas/purchaseOrder.schema';

const today = new Date().toISOString().slice(0, 10);
const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePurchaseOrder();
  const vendorsQuery = useVendors({ page: 1, perPage: 1000 });
  const productsQuery = useProducts({ page: 1, perPage: 1000 });
  const unitsQuery = useUnits({ page: 1, perPage: 1000 });
  const vendors = vendorsQuery.data?.items ?? [];
  const products = productsQuery.data?.items ?? [];
  const units = unitsQuery.data?.items ?? [];
  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreatePurchaseOrderFormInput>({
    resolver: zodResolver(createPurchaseOrderFormSchema),
    defaultValues: {
      head: { po_number: '', vendor_id: '', status: 'draft', po_date: today },
      items: [{ product_id: '', unit_id: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
    },
  });
  const items = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const totalPrice = useMemo(() => (watchedItems ?? []).reduce((total, item) => {
    const subtotal = Number(item?.quantity ?? 0) * Number(item?.unit_price ?? 0);
    return total + subtotal + subtotal * Number(item?.tax_rate ?? 0) / 100;
  }, 0), [watchedItems]);

  const onSubmit = async (values: CreatePurchaseOrderFormInput) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Purchase Order berhasil dibuat');
      navigate('/inventory/purchase-orders');
    } catch {
      toast.error('Purchase Order gagal dibuat. Periksa kembali data yang diisi.');
    }
  };

  return (
    <div className="space-y-6">
      <Card><CardHeader><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/purchase-orders">Purchase Orders</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Create</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><CardTitle className="text-2xl">Create Purchase Order</CardTitle><CardDescription>Buat purchase order menggunakan produk dan satuan dari master data.</CardDescription></CardHeader></Card>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Card><CardHeader><CardTitle>Informasi Purchase Order</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Nomor PO" error={errors.head?.po_number?.message}><Input {...register('head.po_number')} placeholder="PO-2026-001" autoFocus /></Field>
          <Field label="Tanggal PO" error={errors.head?.po_date?.message}><Input type="date" {...register('head.po_date')} /></Field>
          <Field label="Vendor" error={errors.head?.vendor_id?.message}><Select {...register('head.vendor_id')} disabled={vendorsQuery.isLoading}><option value="">Pilih vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={String(vendor.id)}>{vendor.vendor_name}</option>)}</Select></Field>
          <Field label="Status" error={errors.head?.status?.message}><Select {...register('head.status')}><option value="draft">Draft</option><option value="approved">Approved</option><option value="received">Received</option><option value="cancelled">Cancelled</option></Select></Field>
        </CardContent></Card>

        <Card>
          <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Purchase Order Items</CardTitle><CardDescription>Pricelist sudah tidak digunakan. Pilih produk dan satuan dari master data.</CardDescription></div><Button type="button" size="sm" onClick={() => items.append({ product_id: '', unit_id: '', quantity: 1, unit_price: 0, tax_rate: 0 })}><Plus className="h-4 w-4" />Tambah Item</Button></div></CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-[1050px] w-full text-left text-sm">
                <thead className="bg-surface-2"><tr><th className="px-3 py-3">No</th><th className="px-3 py-3">Produk</th><th className="px-3 py-3">Satuan</th><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Harga Satuan</th><th className="px-3 py-3">Pajak (%)</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3 text-center">Aksi</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {items.fields.map((field, index) => {
                    const quantity = Number(watchedItems?.[index]?.quantity ?? 0);
                    const price = Number(watchedItems?.[index]?.unit_price ?? 0);
                    const tax = Number(watchedItems?.[index]?.tax_rate ?? 0);
                    const lineTotal = quantity * price * (1 + tax / 100);
                    return <tr key={field.id}><td className="px-3 py-3">{index + 1}</td><td className="px-3 py-3"><Select {...register(`items.${index}.product_id`)} onChange={(event) => { const product = products.find((item) => String(item.id) === event.target.value); setValue(`items.${index}.product_id`, event.target.value, { shouldValidate: true, shouldDirty: true }); if (product?.unit_id) setValue(`items.${index}.unit_id`, String(product.unit_id), { shouldValidate: true, shouldDirty: true }); }}><option value="">Pilih produk</option>{products.map((product) => <option key={product.id} value={String(product.id)}>{product.product_name}</option>)}</Select>{errors.items?.[index]?.product_id?.message && <p className="mt-1 text-xs text-rose-400">{errors.items[index]?.product_id?.message}</p>}</td><td className="px-3 py-3"><Select {...register(`items.${index}.unit_id`)}><option value="">Pilih satuan</option>{units.map((unit) => <option key={unit.id} value={String(unit.id)}>{unit.unit_name} ({unit.unit_code})</option>)}</Select>{errors.items?.[index]?.unit_id?.message && <p className="mt-1 text-xs text-rose-400">{errors.items[index]?.unit_id?.message}</p>}</td><td className="px-3 py-3"><Input type="number" min="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} /></td><td className="px-3 py-3"><Input type="number" min="0" step="0.01" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} /></td><td className="px-3 py-3"><Input type="number" min="0" step="0.01" {...register(`items.${index}.tax_rate`, { valueAsNumber: true })} /></td><td className="px-3 py-3 text-right font-medium text-text-h">{formatCurrency(lineTotal)}</td><td className="px-3 py-3 text-center"><Button type="button" variant="destructive" size="sm" disabled={items.fields.length === 1} onClick={() => items.remove(index)}><Trash2 className="h-4 w-4" /></Button></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end text-lg font-bold text-text-h">Grand Total: <span className="ml-2 text-accent">{formatCurrency(totalPrice)}</span></div>
          </CardContent>
        </Card>

        {(vendorsQuery.isError || productsQuery.isError || unitsQuery.isError) && <p className="text-sm text-rose-400">Sebagian data master gagal dimuat.</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" asChild><Link to="/inventory/purchase-orders">Batal</Link></Button><Button type="submit" disabled={isSubmitting || createMutation.isPending}>{isSubmitting || createMutation.isPending ? 'Menyimpan...' : 'Simpan Purchase Order'}</Button></div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm text-rose-400">{error}</p>}</div>;
}
