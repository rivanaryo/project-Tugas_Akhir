"use no memo";

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type Resolver, type SubmitHandler } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { useUpdateStockOpname } from '../hooks/useUpdateStockOpname';
import { updateStockOpnameInputSchema, type UpdateStockOpnameInput } from '../schemas/stockOpname.schemas';
import { stockOpnameService } from '../services/stockOpname.service';
import { ProductModal } from '../../stock-movement/components/ProductModal';
import { WarehouseModal } from '../../stock-movement/components/WarehouseModal';
import type { Product } from '../../../masterdata/items/types/product.types';
import type { Warehouse } from '../../../masterdata/warehouses/types/warehouse.types';
import axios from 'axios';

const today = new Date().toISOString().split('T')[0];

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function EditStockOpnamePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateMutation = useUpdateStockOpname();
  const [formError, setFormError] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const [warehouseOverride, setWarehouseOverride] = useState<Warehouse | null>(null);
  const [productOverrides, setProductOverrides] = useState<Record<string, Product>>({});

  const { data: stockOpname, isLoading } = useQuery({
    queryKey: ['inventory', 'stock-opnames', id],
    queryFn: () => stockOpnameService.fetchStockOpname(id!),
    enabled: !!id,
  });

  const warehouseLabel = useMemo(() => {
    if (warehouseOverride) return warehouseOverride.name;
    return stockOpname?.warehouse?.name ?? stockOpname?.warehouse?.warehouse_name ?? 'Belum dipilih';
  }, [warehouseOverride, stockOpname]);

  const selectedProductsById = useMemo(() => {
    const map: Record<string, Product> = {};
    stockOpname?.items?.forEach((item) => {
      const product = item.product;
      if (product) {
        map[String(product.id)] = {
          id: product.id,
          product_name: product.name ?? product.product_name ?? '',
          is_active: true,
        } as Product;
      }
    });
    return { ...map, ...productOverrides };
  }, [stockOpname, productOverrides]);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStockOpnameInput>({
    resolver: zodResolver(updateStockOpnameInputSchema) as Resolver<UpdateStockOpnameInput>,
    defaultValues: {
      opname_number: '',
      opname_date: today,
      m_warehouses_id: '',
      status: 'Draft',
      notes: '',
      items: [{ m_products_id: '', physical_qty: 0, notes: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = useWatch({ control, name: 'items' });

  useEffect(() => {
    if (stockOpname) {
      setValue('opname_number', stockOpname.opname_number);
      setValue('opname_date', stockOpname.opname_date);
      setValue('m_warehouses_id', stockOpname.m_warehouses_id ?? '');
      setValue('status', stockOpname.status);
      setValue('notes', stockOpname.notes ?? '');

      const mappedItems = stockOpname.items?.length
        ? stockOpname.items.map((item) => ({
            m_products_id: item.m_products_id ?? String(item.product?.id ?? ''),
            physical_qty: item.physical_qty ?? 0,
            notes: item.notes ?? '',
          }))
        : [{ m_products_id: '', physical_qty: 0, notes: '' }];

      replace(mappedItems);
    }
  }, [stockOpname, setValue, replace]);

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setWarehouseOverride(warehouse);
    setValue('m_warehouses_id', String(warehouse.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('m_warehouses_id');
    setIsWarehouseModalOpen(false);
  };

  const handleOpenProductModal = (index: number) => {
    setActiveItemIndex(index);
    setIsProductModalOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    if (activeItemIndex === null) return;
    setProductOverrides((prev) => ({ ...prev, [String(product.id)]: product }));
    setValue(`items.${activeItemIndex}.m_products_id`, String(product.id), { shouldValidate: true, shouldDirty: true });
    clearErrors(`items.${activeItemIndex}.m_products_id`);
    setIsProductModalOpen(false);
  };

  const resolveProductLabel = (productIdValue: unknown) => {
    const key = String(productIdValue ?? '');
    if (!key) return '';
    if (selectedProductsById[key]) return selectedProductsById[key].product_name;
    return '';
  };

  const onSubmit: SubmitHandler<UpdateStockOpnameInput> = async (payload) => {
    setFormError(null);
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Stock Opname berhasil diupdate.');
      navigate('/inventory/stock-opname');
    } catch (error: unknown) {
      let message = 'Gagal mengupdate Stock Opname.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      setFormError(message);
      toast.error(message);
    }
  };

  const itemCount = fields.length;

  const totalPhysicalQty = useMemo(() => {
    if (!Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce((sum, item) => {
      const qty = Number(item?.physical_qty ?? 0);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
  }, [watchedItems]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-h">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/stock-opname">Stock Opname</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Edit</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <CardTitle>Edit Stock Opname</CardTitle>
        <CardDescription>Edit data stock opname.</CardDescription>
      </CardHeader>
      <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register('m_warehouses_id')} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-border/70 bg-surface-2/40 p-4">
            <div>
              <Label htmlFor="opname_number">Opname Number</Label>
              <Input id="opname_number" placeholder="SO-YYYYMMDD-XXX" {...register('opname_number')} />
              {errors.opname_number?.message ? <p className="mt-1 text-sm text-destructive">{errors.opname_number.message}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="opname_date">Opname Date</Label>
                <Input id="opname_date" type="date" {...register('opname_date')} />
                {errors.opname_date?.message ? <p className="mt-1 text-sm text-destructive">{errors.opname_date.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register('status')}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.status?.message ? <p className="mt-1 text-sm text-destructive">{errors.status.message}</p> : null}
              </div>
            </div>

            <div>
              <Label htmlFor="warehouse">Warehouse</Label>
              <div className="flex gap-2">
                <Input id="warehouse" value={warehouseLabel} readOnly className="bg-surface-1" />
                <Button type="button" onClick={() => setIsWarehouseModalOpen(true)}>
                  Pilih Warehouse
                </Button>
              </div>
              {errors.m_warehouses_id?.message ? (
                <p className="mt-1 text-sm text-destructive">{errors.m_warehouses_id.message}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Catatan stock opname" {...register('notes')} />
            </div>

            {formError ? <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{formError}</p> : null}
          </div>

          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
                <CardDescription>Pastikan data yang diisi sudah benar.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm text-text">
                  <div className="flex items-center justify-between">
                    <span>Opname Number</span>
                    <strong className="text-text-h">{control._formValues.opname_number || '-'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Opname Date</span>
                    <strong className="text-text-h">{control._formValues.opname_date || '-'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <strong className="text-text-h">{control._formValues.status || '-'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Warehouse</span>
                    <strong className="text-text-h">{warehouseLabel}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Item</span>
                    <strong className="text-text-h">{itemCount}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Physical Qty</span>
                    <strong className="text-text-h">{totalPhysicalQty}</strong>
                  </div>
                </div>

                <hr className="my-4 border-border/70" />

                <div className="space-y-3 text-sm text-text italic">
                  <p>1. Klik <span className="font-semibold text-text-h">Pilih Warehouse</span> untuk memilih warehouse.</p>
                  <p>2. Tambahkan item dan pilih product untuk setiap baris.</p>
                  <p>3. Masukkan <span className="font-semibold text-text-h">Physical Quantity</span> untuk setiap product.</p>
                  <p>4. Sistem akan menghitung selisih berdasarkan stok sistem.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-surface-2/40 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-h">Stock Opname Items</p>
              <p className="text-sm text-text">Daftar product yang akan diopname</p>
            </div>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => append({ m_products_id: '', physical_qty: 0, notes: '' })}
            >
              <Plus className="h-4 w-4" />
              Tambah Item
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
            <table className="min-w-[700px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  <th className="table-head px-4 py-3 font-semibold text-text-h">No</th>
                  <th className="table-head px-4 py-3 font-semibold text-text-h">Product</th>
                  <th className="table-head px-4 py-3 font-semibold text-text-h">Physical Qty</th>
                  <th className="table-head px-4 py-3 font-semibold text-text-h">Notes</th>
                  <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-surface-2/30">
                    <td className="px-4 py-3 text-text-h font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Input
                          value={resolveProductLabel(watchedItems?.[index]?.m_products_id)}
                          placeholder="Pilih product"
                          readOnly
                          className={errors.items?.[index]?.m_products_id ? 'border-red-600' : ''}
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenProductModal(index)}>
                          Pilih
                        </Button>
                      </div>
                      {errors.items?.[index]?.m_products_id?.message ? (
                        <p className="mt-1 text-sm text-destructive">{errors.items[index]?.m_products_id?.message}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        {...register(`items.${index}.physical_qty` as const, { valueAsNumber: true })}
                        className="w-28"
                      />
                      {errors.items?.[index]?.physical_qty?.message ? (
                        <p className="mt-1 text-sm text-destructive">{errors.items[index]?.physical_qty?.message}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        {...register(`items.${index}.notes` as const)}
                        placeholder="Catatan item"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.items?.message ? (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-border pt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/inventory/stock-opname')}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
            {isSubmitting || updateMutation.isPending ? 'Menyimpan...' : 'Update Stock Opname'}
          </Button>
        </div>

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSelectProduct={handleSelectProduct}
        />

        <WarehouseModal
          isOpen={isWarehouseModalOpen}
          onClose={() => setIsWarehouseModalOpen(false)}
          onSelectWarehouse={handleSelectWarehouse}
        />
      </form>
      </CardContent>
    </Card>
  );
}
