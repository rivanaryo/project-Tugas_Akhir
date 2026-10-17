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
import { updateUnitInputSchema, type UpdateUnitInput } from '../schemas/unit.schema';
import { useUpdateUnit } from '../hooks/useUpdateUnit';
import type { Unit } from '../types/unit.types';

interface EditUnitDialogProps {
  open: boolean;
  unit: Unit | null;
  onOpenChange: (open: boolean) => void;
}

interface UnitApiErrorResponse {
  message?: string;
  errors?: {
    unit_code?: string[];
    unit_name?: string[];
  };
}

export function EditUnitDialog({ open, unit, onOpenChange }: EditUnitDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const updateUnitMutation = useUpdateUnit();

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
  } = useForm<z.input<typeof updateUnitInputSchema>, unknown, UpdateUnitInput>({
    resolver: zodResolver(updateUnitInputSchema),
    defaultValues: {
      unit_code: '',
      unit_name: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  useEffect(() => {
    if (!open || !unit) {
      return;
    }

    reset({
      unit_code: unit.unit_code ?? '',
      unit_name: unit.unit_name,
      is_active: unit.is_active,
    });
  }, [open, unit, reset]);

  const onSubmit = async (values: UpdateUnitInput) => {
    if (!unit) {
      return;
    }

    setFormError(null);

    try {
      const result = await updateUnitMutation.mutateAsync({
        id: unit.id,
        data: values,
      });

      toast.success(result.message);
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError<UnitApiErrorResponse>(error)) {
        const unitCodeApiError = error.response?.data?.errors?.unit_code?.[0];
        const unitNameApiError = error.response?.data?.errors?.unit_name?.[0];

        if (unitCodeApiError) {
          setError('unit_code', { type: 'server', message: unitCodeApiError });
          toast.error(unitCodeApiError);
          return;
        }

        if (unitNameApiError) {
          setError('unit_name', { type: 'server', message: unitNameApiError });
          toast.error(unitNameApiError);
          return;
        }

        const message = error.response?.data?.message;

        if (message) {
          setFormError(message);
          toast.error(message);
          return;
        }
      }

      setFormError('Failed to update unit. Please try again.');
      toast.error('Failed to update unit. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
          <DialogDescription>
            Perbarui data unit yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="edit-unit-code">Unit Code</Label>
            <Input
              id="edit-unit-code"
              {...register('unit_code')}
              placeholder="Masukkan kode unit"
              autoFocus
            />
            {errors.unit_code?.message && <p className="text-sm text-rose-400">{errors.unit_code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-unit-name">Unit Name</Label>
            <Input
              id="edit-unit-name"
              {...register('unit_name')}
              placeholder="Masukkan nama unit"
            />
            {errors.unit_name?.message && <p className="text-sm text-rose-400">{errors.unit_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-unit-active">Status</Label>
            <label htmlFor="edit-unit-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="edit-unit-active"
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
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {formError}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !unit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
