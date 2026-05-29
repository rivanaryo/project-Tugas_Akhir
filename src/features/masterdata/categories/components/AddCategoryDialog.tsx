import { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
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
import { createCategoryInputSchema, type CreateCategoryInput } from '../schemas/category.schema';
import { useCreateCategory } from '../hooks/useCreateCategory';

interface AddCategoryDialogProps {
  onCreated?: () => void;
}

interface CategoryApiErrorResponse {
  message?: string;
  errors?: {
    category_name?: string[];
  };
}

export function AddCategoryDialog({ onCreated }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createCategoryMutation = useCreateCategory();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createCategoryInputSchema>, unknown, CreateCategoryInput>({
    resolver: zodResolver(createCategoryInputSchema),
    defaultValues: {
      category_name: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  const resetForm = () => {
    reset({ category_name: '', is_active: true });
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const onSubmit = async (values: CreateCategoryInput) => {
    setFormError(null);

    try {
      const result = await createCategoryMutation.mutateAsync(values);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
    } catch (error) {
      if (axios.isAxiosError<CategoryApiErrorResponse>(error)) {
        const categoryNameApiError = error.response?.data?.errors?.category_name?.[0];

        if (categoryNameApiError) {
          setError('category_name', { type: 'server', message: categoryNameApiError });
          toast.error(categoryNameApiError);
          return;
        }

        const message = error.response?.data?.message;

        if (message) {
          setFormError(message);
          toast.error(message);
          return;
        }
      }

      setFormError('Failed to create category. Please try again.');
      toast.error('Failed to create category. Please try again.');
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
          <DialogTitle>Tambah Category</DialogTitle>
          <DialogDescription>
            Tambahkan category baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              {...register('category_name')}
              placeholder="Masukkan nama category"
              autoFocus
            />
            {errors.category_name?.message && (
              <p className="text-sm text-red-600">
                {errors.category_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-active">Status</Label>
            <label htmlFor="category-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="category-active"
                type="checkbox"
                {...register('is_active')}
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
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}