import { useState } from 'react';
import { X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { ProductModal } from '../../../inventory/stock-movement/components/ProductModal';
import { WarehouseModal } from '../../../inventory/stock-movement/components/WarehouseModal';
import {
  predictionInputSchema,
  type PredictionInput,
} from '../schemas/prediction.schemas';
import type { Product } from '../../../masterdata/items/types/product.types';
import type { Warehouse } from '../../../masterdata/warehouses/types/warehouse.types';

interface PredictionFormProps {
  onSubmit: (input: PredictionInput) => void;
  isPending: boolean;
}

export function PredictionForm({ onSubmit, isPending }: PredictionFormProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<PredictionInput>({
    resolver: zodResolver(predictionInputSchema) as Resolver<PredictionInput>,
    defaultValues: {
      product_id: '',
      warehouse_id: '',
      days_to_predict: 7,
    },
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setValue('product_id', String(product.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('product_id');
    setIsProductModalOpen(false);
  };

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setValue('warehouse_id', String(warehouse.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('warehouse_id');
    setIsWarehouseModalOpen(false);
  };

  const handleClearWarehouse = () => {
    setSelectedWarehouse(null);
    setValue('warehouse_id', '', { shouldValidate: true, shouldDirty: true });
  };

  const onSubmitForm: SubmitHandler<PredictionInput> = (values) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <input type="hidden" {...register('product_id')} />
      <input type="hidden" {...register('warehouse_id')} />

      <div className="space-y-4 rounded-xl border border-border/70 bg-surface-2/40 p-4">
        <div>
          <Label htmlFor="product_display">Product <span className="text-red-500">*</span></Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="product_display"
              value={selectedProduct?.product_name ?? 'Belum dipilih'}
              readOnly
              className="bg-surface-1"
            />
            <Button type="button" onClick={() => setIsProductModalOpen(true)}>
              Pilih Product
            </Button>
          </div>
          {errors.product_id?.message ? (
            <p className="mt-1.5 text-sm text-destructive">{errors.product_id.message}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="warehouse_display">Warehouse <span className="text-text">(Opsional)</span></Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="warehouse_display"
              value={selectedWarehouse?.name ?? 'Belum dipilih'}
              readOnly
              className="bg-surface-1"
            />
            <Button type="button" variant="secondary" onClick={() => setIsWarehouseModalOpen(true)}>
              Pilih Warehouse
            </Button>
            {selectedWarehouse ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Hapus warehouse"
                onClick={handleClearWarehouse}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="max-w-xs">
          <Label htmlFor="days_to_predict">Jumlah Hari Prediksi</Label>
          <Input
            id="days_to_predict"
            type="number"
            min={1}
            {...register('days_to_predict', { valueAsNumber: true })}
          />
          {errors.days_to_predict?.message ? (
            <p className="mt-1.5 text-sm text-destructive">{errors.days_to_predict.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Memproses...' : 'Prediksi'}
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
  );
}
