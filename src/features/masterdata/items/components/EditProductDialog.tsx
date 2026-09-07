import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { updateProductInputSchema } from '../schemas/product.schema';
import { useUpdateProduct } from '../hooks/useUpdateProduct';
import type { Product } from '../types/product.types';

interface EditProductDialogProps {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

interface ProductApiErrorResponse {
  message?: string;
  errors?: {
    product_name?: string[];
    stock_level?: string[];
    min_stock_level?: string[];
  };
}

export function EditProductDialog({ open, product, onOpenChange }: EditProductDialogProps) {
  const [draft, setDraft] = useState<{ product_name: string; is_active: boolean; stock_level?: number; min_stock_level?: number } | null>(null);
  const [productNameError, setProductNameError] = useState<string | null>(null);
  const [stockLevelError, setStockLevelError] = useState<string | null>(null);
  const [minStockLevelError, setMinStockLevelError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const updateProductMutation = useUpdateProduct();

  const productName = draft?.product_name ?? product?.product_name ?? '';
  const isActive = draft?.is_active ?? product?.is_active ?? true;
  const stockLevel = draft?.stock_level ?? product?.stock_level;
  const minStockLevel = draft?.min_stock_level ?? product?.min_stock_level;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraft(null);
      setProductNameError(null);
      setStockLevelError(null);
      setMinStockLevelError(null);
      setFormError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product) {
      return;
    }

    setProductNameError(null);
    setStockLevelError(null);
    setMinStockLevelError(null);
    setFormError(null);

    const parsed = updateProductInputSchema.safeParse({
      product_name: productName,
      is_active: isActive,
      stock_level: stockLevel,
      min_stock_level: minStockLevel,
    });

    if (!parsed.success) {
      const productNameIssue = parsed.error.issues.find((issue) => issue.path.includes('product_name'));
      const stockLevelIssue = parsed.error.issues.find((issue) => issue.path.includes('stock_level'));
      const minStockLevelIssue = parsed.error.issues.find((issue) => issue.path.includes('min_stock_level'));

      if (productNameIssue?.message) {
        setProductNameError(productNameIssue.message);
      } else if (stockLevelIssue?.message) {
        setStockLevelError(stockLevelIssue.message);
      } else if (minStockLevelIssue?.message) {
        setMinStockLevelError(minStockLevelIssue.message);
      } else {
        setFormError(parsed.error.issues[0]?.message ?? 'Please check your input');
      }

      return;
    }

    try {
      const result = await updateProductMutation.mutateAsync({
        id: product.id,
        data: parsed.data,
      });

      toast.success(result.message);
      setDraft(null);
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError<ProductApiErrorResponse>(error)) {
        const productNameApiError = error.response?.data?.errors?.product_name?.[0];
        const stockLevelApiError = error.response?.data?.errors?.stock_level?.[0];
        const minStockLevelApiError = error.response?.data?.errors?.min_stock_level?.[0];

        if (productNameApiError) {
          setProductNameError(productNameApiError);
          toast.error(productNameApiError);
          return;
        }

        if (stockLevelApiError) {
          setStockLevelError(stockLevelApiError);
          toast.error(stockLevelApiError);
          return;
        }

        if (minStockLevelApiError) {
          setMinStockLevelError(minStockLevelApiError);
          toast.error(minStockLevelApiError);
          return;
        }

        const message = error.response?.data?.message;

        if (message) {
          setFormError(message);
          toast.error(message);
          return;
        }
      }

      setFormError('Failed to update product. Please try again.');
      toast.error('Failed to update product. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Perbarui data product yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-product-name">Product Name</Label>
            <Input
              id="edit-product-name"
              value={productName}
              onChange={(event) => {
                setDraft((previousDraft) => ({
                  product_name: event.target.value,
                  is_active: previousDraft?.is_active ?? product?.is_active ?? true,
                  stock_level: previousDraft?.stock_level ?? product?.stock_level,
                  min_stock_level: previousDraft?.min_stock_level ?? product?.min_stock_level,
                }));
                setProductNameError(null);
                setFormError(null);
              }}
              placeholder="Masukkan nama product"
              autoFocus
            />
            {productNameError && <p className="text-sm text-red-600">{productNameError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-stock-level">Stock Level</Label>
            <Input
              id="edit-stock-level"
              type="number"
              value={stockLevel ?? ''}
              onChange={(event) => {
                const value = event.target.value ? Number(event.target.value) : undefined;
                setDraft((previousDraft) => ({
                  product_name: previousDraft?.product_name ?? product?.product_name ?? '',
                  is_active: previousDraft?.is_active ?? product?.is_active ?? true,
                  stock_level: value,
                  min_stock_level: previousDraft?.min_stock_level ?? product?.min_stock_level,
                }));
                setStockLevelError(null);
                setFormError(null);
              }}
              placeholder="Masukkan stock level"
            />
            {stockLevelError && <p className="text-sm text-red-600">{stockLevelError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-min-stock-level">Min Stock Level</Label>
            <Input
              id="edit-min-stock-level"
              type="number"
              value={minStockLevel ?? ''}
              onChange={(event) => {
                const value = event.target.value ? Number(event.target.value) : undefined;
                setDraft((previousDraft) => ({
                  product_name: previousDraft?.product_name ?? product?.product_name ?? '',
                  is_active: previousDraft?.is_active ?? product?.is_active ?? true,
                  stock_level: previousDraft?.stock_level ?? product?.stock_level,
                  min_stock_level: value,
                }));
                setMinStockLevelError(null);
                setFormError(null);
              }}
              placeholder="Masukkan minimum stock level"
            />
            {minStockLevelError && <p className="text-sm text-red-600">{minStockLevelError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-product-active">Status</Label>
            <label htmlFor="edit-product-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="edit-product-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) => {
                  setDraft((previousDraft) => ({
                    product_name: previousDraft?.product_name ?? product?.product_name ?? '',
                    is_active: event.target.checked,
                    stock_level: previousDraft?.stock_level ?? product?.stock_level,
                    min_stock_level: previousDraft?.min_stock_level ?? product?.min_stock_level,
                  }));
                  setFormError(null);
                }}
                className="h-4 w-4 rounded border border-border accent-accent"
              />
              <span>
                {isActive ? 'Aktif (true)' : 'Tidak Aktif (false)'}
              </span>
            </label>
          </div>

          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={updateProductMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateProductMutation.isPending || !product}>
              {updateProductMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
