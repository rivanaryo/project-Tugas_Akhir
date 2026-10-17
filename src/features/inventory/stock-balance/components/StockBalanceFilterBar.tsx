import type { ChangeEvent } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import type { Warehouse } from '../../../masterdata/warehouses/types/warehouse.types';
import type { Product } from '../../../masterdata/items/types/product.types';

interface StockBalanceFilterBarProps {
  q: string;
  warehouseId: string;
  productId: string;
  warehouses: Warehouse[];
  products: Product[];
  isWarehousesLoading: boolean;
  isProductsLoading: boolean;
  isLoading: boolean;
  onChangeQ: (value: string) => void;
  onChangeWarehouse: (value: string) => void;
  onChangeProduct: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function StockBalanceFilterBar({
  q,
  warehouseId,
  productId,
  warehouses,
  products,
  isWarehousesLoading,
  isProductsLoading,
  isLoading,
  onChangeQ,
  onChangeWarehouse,
  onChangeProduct,
  onFilter,
  onReset,
}: StockBalanceFilterBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sb-search">Search</Label>
            <Input
              id="sb-search"
              placeholder="Cari nama produk / gudang..."
              value={q}
              onChange={(e) => onChangeQ(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sb-warehouse">Gudang</Label>
            <Select
              id="sb-warehouse"
              value={warehouseId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChangeWarehouse(e.target.value)}
              disabled={isWarehousesLoading || isLoading}
            >
              <option value="">Semua Gudang</option>
              {warehouses.map((w) => (
                <option key={String(w.id)} value={String(w.id)}>
                  {w.name} ({w.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sb-product">Produk</Label>
            <Select
              id="sb-product"
              value={productId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChangeProduct(e.target.value)}
              disabled={isProductsLoading || isLoading}
            >
              <option value="">Semua Produk</option>
              {products.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.product_name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
            Reset
          </Button>
          <Button type="button" onClick={onFilter} disabled={isLoading}>
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
