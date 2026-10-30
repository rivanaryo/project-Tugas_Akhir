"use no memo";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type Resolver, type SubmitHandler } from 'react-hook-form';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select } from '../../../../../components/ui/select';
import { useCreateStockMovement } from '../../hooks/useCreateStockMovement';
import { createStockMovementInputSchema, type CreateStockMovementInput } from '../../schemas/stockMovement.schemas';
import { ProductModal } from '../../components/ProductModal';
import { WarehouseModal } from '../../components/WarehouseModal';
import { ReferenceModal } from '../../components/ReferenceModal';
import type { Product } from '../../../../masterdata/items/types/product.types';
import type { Warehouse } from '../../../../masterdata/warehouses/types/warehouse.types';
import type { CreateReferenceableType } from '../../types/stockMovement.types';
import axios from 'axios';

export function StockMovementCreateForm() {
  const navigate = useNavigate();
  const createMutation = useCreateStockMovement();
  const [formError, setFormError] = useState<string | null>(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>('');
  const [selectedReferenceType, setSelectedReferenceType] = useState<CreateReferenceableType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateStockMovementInput>({
    resolver: zodResolver(createStockMovementInputSchema) as Resolver<CreateStockMovementInput>,
    defaultValues: {
      m_products_id: '',
      m_warehouses_id: '',
      type: 'in',
      quantity: 1,
      reference_number: '',
      referenceable_id: '',
      referenceable_type: undefined,
      description: '',
    },
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setValue('m_products_id', String(product.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('m_products_id');
    setIsProductModalOpen(false);
  };

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setValue('m_warehouses_id', String(warehouse.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('m_warehouses_id');
    setIsWarehouseModalOpen(false);
  };

  const handleSelectReference = (id: string, type: CreateReferenceableType) => {
    setSelectedReferenceId(id);
    setSelectedReferenceType(type);
    setValue('referenceable_id', id, { shouldValidate: true, shouldDirty: true });
    setValue('referenceable_type', type, { shouldValidate: true, shouldDirty: true });
    clearErrors(['referenceable_id', 'referenceable_type']);
  };

  const onSubmit: SubmitHandler<CreateStockMovementInput> = async (payload) => {
    setFormError(null);

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Stock Movement berhasil dibuat.');
      navigate('/inventory/stock-movements');
    } catch (error: unknown) {
      let message = 'Gagal membuat Stock Movement.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      setFormError(message);
      toast.error(message);
    }
  };

  const productLabel = selectedProduct?.product_name ?? 'Belum dipilih';
  const warehouseLabel = selectedWarehouse?.name ?? 'Belum dipilih';
  const referenceLabel = selectedReferenceType 
    ? `${selectedReferenceType}: ${selectedReferenceId}` 
    : 'Belum dipilih';

  const formValues = useWatch({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('m_products_id')} />
      <input type="hidden" {...register('m_warehouses_id')} />
      <input type="hidden" {...register('referenceable_id')} />
      <input type="hidden" {...register('referenceable_type')} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border/70 bg-surface-2/40 p-4">
          <div>
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input id="reference_number" placeholder="SM-YYYYMMDD-XXX" {...register('reference_number')} />
            {errors.reference_number?.message ? <p className="mt-1 text-sm text-destructive">{errors.reference_number.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="product">Product</Label>
            <div className="flex gap-2">
              <Input id="product" value={productLabel} readOnly className="bg-surface-1" />
              <Button type="button" onClick={() => setIsProductModalOpen(true)}>
                Pilih Product
              </Button>
            </div>
            {errors.m_products_id?.message ? (
              <p className="mt-1 text-sm text-destructive">{errors.m_products_id.message}</p>
            ) : null}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                id="type" 
                {...register('type')}
                onChange={(e) => {
                  register('type').onChange(e);
                }}
              >
                <option value="in">In (Masuk)</option>
                <option value="out">Out (Keluar)</option>
              </Select>
              {errors.type?.message ? (
                <p className="mt-1 text-sm text-destructive">{errors.type.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" {...register('quantity', { valueAsNumber: true })} />
              {errors.quantity?.message ? (
                <p className="mt-1 text-sm text-destructive">{errors.quantity.message}</p>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="reference">Referensi Stock Opname (Wajib)</Label>
            <div className="flex gap-2">
              <Input id="reference" value={referenceLabel} readOnly className="bg-surface-1" />
              <Button type="button" variant="secondary" onClick={() => setIsReferenceModalOpen(true)}>
                Pilih Referensi
              </Button>
            </div>
            {errors.referenceable_id?.message || errors.referenceable_type?.message ? <p className="mt-1 text-sm text-destructive">{errors.referenceable_id?.message ?? errors.referenceable_type?.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input id="description" maxLength={255} placeholder="Deskripsi stock movement" {...register('description')} />
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
                  <span>Reference Number</span>
                  <strong className="text-text-h">{formValues.reference_number || '-'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Product</span>
                  <strong className="text-text-h">{productLabel}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Warehouse</span>
                  <strong className="text-text-h">{warehouseLabel}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <strong className="text-accent">{formValues.type}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quantity</span>
                  <strong className="text-text-h">{formValues.quantity}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reference</span>
                  <strong className="text-text-h">{referenceLabel}</strong>
                </div>
              </div>

              <hr className="my-4 border-border/70" />

              <div className="space-y-3 text-sm text-text italic">
                <p>1. Klik <span className="font-semibold text-text-h">Pilih Product</span> untuk memilih product.</p>
                <p>2. Klik <span className="font-semibold text-text-h">Pilih Warehouse</span> untuk memilih warehouse.</p>
                <p>3. Pilih <span className="font-semibold text-text-h">Type</span> (In/Out) dan masukkan quantity.</p>
                <p>4. Pilih referensi Stock Opname yang valid. Movement manual mengubah stok produk; hindari penyesuaian ganda dari opname Completed.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-border pt-6">
        <Button type="button" variant="secondary" onClick={() => navigate('/inventory/stock-movements')}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {isSubmitting || createMutation.isPending ? 'Menyimpan...' : 'Simpan Stock Movement'}
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

      <ReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        onSelectReference={handleSelectReference}
      />
    </form>
  );
}
