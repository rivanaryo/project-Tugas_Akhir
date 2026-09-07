"use no memo";

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../../components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { useUpdateStockMovement } from '../hooks/useUpdateStockMovement';
import { updateStockMovementInputSchema, type UpdateStockMovementInput } from '../schemas/stockMovement.schemas';
import { stockMovementService } from '../services/stockMovement.service';
import { ProductModal } from '../components/ProductModal';
import { WarehouseModal } from '../components/WarehouseModal';
import { ReferenceModal } from '../components/ReferenceModal';
import type { Product } from '../../../masterdata/items/types/product.types';
import type { Warehouse } from '../../../masterdata/warehouses/types/warehouse.types';
import type { CreateReferenceableType } from '../types/stockMovement.types';
import axios from 'axios';

export function EditStockMovementPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateMutation = useUpdateStockMovement();
  const [formError, setFormError] = useState<string | null>(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>('');
  const [selectedReferenceType, setSelectedReferenceType] = useState<CreateReferenceableType | null>(null);

  const { data: stockMovement, isLoading } = useQuery({
    queryKey: ['inventory', 'stock-movements', id],
    queryFn: () => stockMovementService.fetchStockMovement(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStockMovementInput>({
    resolver: zodResolver(updateStockMovementInputSchema) as Resolver<UpdateStockMovementInput>,
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

  useEffect(() => {
    if (stockMovement) {
      setValue('m_products_id', stockMovement.m_products_id ?? '');
      setValue('m_warehouses_id', stockMovement.m_warehouses_id ?? '');
      setValue('type', stockMovement.type);
      setValue('quantity', stockMovement.quantity);
      setValue('reference_number', stockMovement.reference_number);
      setValue('referenceable_id', stockMovement.referenceable_id ?? '');
      setValue('referenceable_type', (stockMovement.referenceable_type as CreateReferenceableType) ?? undefined);
      setValue('description', stockMovement.description ?? '');

      if (stockMovement.product) {
        setSelectedProduct({
          id: stockMovement.product.id,
          product_name: stockMovement.product.product_name ?? stockMovement.product.name ?? '',
          unit_id: undefined,
          is_active: true,
        } as Product);
      }
      if (stockMovement.warehouse) {
        setSelectedWarehouse({
          id: stockMovement.warehouse.id,
          code: stockMovement.warehouse.warehouse_code ?? '',
          name: stockMovement.warehouse.warehouse_name,
          location: stockMovement.warehouse.location ?? '',
          is_active: true,
        } as Warehouse);
      }
      if (stockMovement.referenceable_id) setSelectedReferenceId(stockMovement.referenceable_id);
      if (stockMovement.referenceable_type) setSelectedReferenceType(stockMovement.referenceable_type as CreateReferenceableType);
    }
  }, [stockMovement, setValue]);

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

  const handleSelectReference = (refId: string, type: CreateReferenceableType) => {
    setSelectedReferenceId(refId);
    setSelectedReferenceType(type);
    setValue('referenceable_id', refId, { shouldValidate: true, shouldDirty: true });
    setValue('referenceable_type', type, { shouldValidate: true, shouldDirty: true });
    clearErrors(['referenceable_id', 'referenceable_type']);
    setIsReferenceModalOpen(false);
  };

  const onSubmit: SubmitHandler<UpdateStockMovementInput> = async (payload) => {
    setFormError(null);
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Stock Movement berhasil diupdate.');
      navigate('/inventory/stock-movements');
    } catch (error: unknown) {
      let message = 'Gagal mengupdate Stock Movement.';
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

  const formValues = watch();

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
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory">Inventory</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link to="/inventory/stock-movements">Stock Movements</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Edit</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <CardTitle>Edit Stock Movement</CardTitle>
        <CardDescription>Edit data stock movement.</CardDescription>
      </CardHeader>
      <CardContent>
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
              <Label htmlFor="reference">Reference (Optional)</Label>
              <div className="flex gap-2">
                <Input id="reference" value={referenceLabel} readOnly className="bg-surface-1" />
                <Button type="button" variant="secondary" onClick={() => setIsReferenceModalOpen(true)}>
                  Pilih Referensi
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" placeholder="Deskripsi stock movement" {...register('description')} />
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
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-border pt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/inventory/stock-movements')}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
            {isSubmitting || updateMutation.isPending ? 'Menyimpan...' : 'Update Stock Movement'}
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
      </CardContent>
    </Card>
  );
}
