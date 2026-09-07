import { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
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
  DialogTrigger,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { createProductInputSchema } from '../schemas/product.schema';
import { useCreateProduct } from '../hooks/useCreateProduct';

interface AddProductDialogProps {
  onCreated?: () => void;
}

interface ProductApiErrorResponse {
  message?: string;
  errors?: {
    product_name?: string[];
    stock_level?: string[];
    min_stock_level?: string[];
  };
}

export function AddProductDialog({ onCreated }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [stockLevel, setStockLevel] = useState<number | undefined>(undefined);
  const [minStockLevel, setMinStockLevel] = useState<number | undefined>(undefined);
  const [productNameError, setProductNameError] = useState<string | null>(null);
  const [stockLevelError, setStockLevelError] = useState<string | null>(null);
  const [minStockLevelError, setMinStockLevelError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const createProductMutation = useCreateProduct();

  const resetForm = () => {
    setProductName('');
    setIsActive(true);
    setStockLevel(undefined);
    setMinStockLevel(undefined);
    setProductNameError(null);
    setStockLevelError(null);
    setMinStockLevelError(null);
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductNameError(null);
    setStockLevelError(null);
    setMinStockLevelError(null);
    setFormError(null);

    const parsed = createProductInputSchema.safeParse({
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
        const firstError = parsed.error.issues[0]?.message ?? 'Please check your input';
        setFormError(firstError);
      }

      return;
    }

    try {
      const result = await createProductMutation.mutateAsync(parsed.data);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
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

      setFormError('Failed to create product. Please try again.');
      toast.error('Failed to create product. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Product</DialogTitle>
          <DialogDescription>
            Tambahkan product baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={(event) => {
                setProductName(event.target.value);
                setProductNameError(null);
              }}
              placeholder="Masukkan nama product"
              autoFocus
            />
            {productNameError && (
              <p className="text-sm text-red-600">
                {productNameError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-level">Stock Level</Label>
            <Input
              id="stock-level"
              type="number"
              value={stockLevel ?? ''}
              onChange={(event) => {
                const value = event.target.value ? Number(event.target.value) : undefined;
                setStockLevel(value);
                setStockLevelError(null);
              }}
              placeholder="Masukkan stock level"
            />
            {stockLevelError && (
              <p className="text-sm text-red-600">
                {stockLevelError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-stock-level">Min Stock Level</Label>
            <Input
              id="min-stock-level"
              type="number"
              value={minStockLevel ?? ''}
              onChange={(event) => {
                const value = event.target.value ? Number(event.target.value) : undefined;
                setMinStockLevel(value);
                setMinStockLevelError(null);
              }}
              placeholder="Masukkan minimum stock level"
            />
            {minStockLevelError && (
              <p className="text-sm text-red-600">
                {minStockLevelError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-active">Status</Label>
            <label htmlFor="product-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="product-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 rounded border border-border accent-accent"
              />
              <span>
                {isActive ? 'Aktif' : 'Tidak Aktif'}
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
              <Button type="button" variant="secondary" disabled={createProductMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
