import { useEffect, useState } from 'react';
import axios from 'axios';
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
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { updateCategoryInputSchema, type UpdateCategoryInput } from '../schemas/category.schema';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import type { Category } from '../types/category.types';

interface EditCategoryDialogProps {
  open: boolean;
  category: Category | null;
  onOpenChange: (open: boolean) => void;
}

interface CategoryApiErrorResponse {
  message?: string;
  errors?: {
    category_name?: string[];
  };
}

export function EditCategoryDialog({ open, category, onOpenChange }: EditCategoryDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const updateCategoryMutation = useUpdateCategory();

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormError(null);
    }
    onOpenChange(nextOpen);
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof updateCategoryInputSchema>, unknown, UpdateCategoryInput>({
    resolver: zodResolver(updateCategoryInputSchema),
    defaultValues: {
      category_name: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  useEffect(() => {
    if (!open || !category) {
      return;
    }

    reset({
      category_name: category.category_name,
      is_active: category.is_active,
    });
  }, [open, category, reset]);

  const onSubmit = async (values: UpdateCategoryInput) => {
    if (!category) {
      return;
    }

    setFormError(null);

    try {
      const result = await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: values,
      });

      toast.success(result.message);
      onOpenChange(false);
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

      setFormError('Failed to update category. Please try again.');
      toast.error('Failed to update category. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Perbarui data category yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="edit-category-name">Category Name</Label>
            <Input
              id="edit-category-name"
              {...register('category_name')}
              placeholder="Masukkan nama category"
              autoFocus
            />
            {errors.category_name?.message && <p className="text-sm text-red-600">{errors.category_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category-active">Status</Label>
            <label htmlFor="edit-category-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="edit-category-active"
                type="checkbox"
                {...register('is_active')}
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
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !category}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}