import { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { createProductInputSchema } from '../schemas/product.schema';
import { useCreateProduct } from '../hooks/useCreateProduct';

interface AddProductDialogProps {
  onCreated?: () => void;
}

interface ProductApiErrorResponse {
  message?: string;
  errors?: { product_name?: string[] };
}

export function AddProductDialog({ onCreated }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [productNameError, setProductNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const createProductMutation = useCreateProduct();

  const resetForm = () => {
    setProductName('');
    setIsActive(true);
    setProductNameError(null);
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductNameError(null);
    setFormError(null);
    const parsed = createProductInputSchema.safeParse({ product_name: productName, is_active: isActive });
    if (!parsed.success) {
      setProductNameError(parsed.error.issues.find((issue) => issue.path.includes('product_name'))?.message ?? null);
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
        const message = error.response?.data?.errors?.product_name?.[0] ?? error.response?.data?.message;
        if (message) {
          setProductNameError(error.response?.data?.errors?.product_name?.[0] ?? null);
          setFormError(error.response?.data?.errors?.product_name?.[0] ? null : message);
          toast.error(message);
          return;
        }
      }
      setFormError('Failed to create product. Please try again.');
      toast.error('Failed to create product. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) resetForm(); }}>
      <DialogTrigger asChild><Button type="button" size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Tambah</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Product</DialogTitle><DialogDescription>Tambahkan product baru untuk master data.</DialogDescription></DialogHeader>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2"><Label htmlFor="product-name">Product Name</Label><Input id="product-name" value={productName} onChange={(event) => { setProductName(event.target.value); setProductNameError(null); }} placeholder="Masukkan nama product" autoFocus />{productNameError && <p className="text-sm text-rose-400">{productNameError}</p>}</div>
          <div className="space-y-2"><Label htmlFor="product-active">Status</Label><label htmlFor="product-active" className="flex items-center gap-2 text-sm text-text-h"><input id="product-active" type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded border border-border accent-accent" /><span>{isActive ? 'Aktif' : 'Tidak Aktif'}</span></label></div>
          {formError && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{formError}</p>}
          <DialogFooter><DialogClose asChild><Button type="button" variant="secondary" disabled={createProductMutation.isPending}>Batal</Button></DialogClose><Button type="submit" disabled={createProductMutation.isPending}>{createProductMutation.isPending ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
