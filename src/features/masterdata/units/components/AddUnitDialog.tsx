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
import { createUnitInputSchema, type CreateUnitInput } from '../schemas/unit.schema';
import { useCreateUnit } from '../hooks/useCreateUnit';

interface AddUnitDialogProps {
  onCreated?: () => void;
}

interface UnitApiErrorResponse {
  message?: string;
  errors?: {
    unit_code?: string[];
    unit_name?: string[];
  };
}

export function AddUnitDialog({ onCreated }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createUnitMutation = useCreateUnit();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createUnitInputSchema>, unknown, CreateUnitInput>({
    resolver: zodResolver(createUnitInputSchema),
    defaultValues: {
      unit_code: '',
      unit_name: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  const resetForm = () => {
    reset({ unit_code: '', unit_name: '', is_active: true });
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const onSubmit = async (values: CreateUnitInput) => {
    setFormError(null);

    try {
      const result = await createUnitMutation.mutateAsync(values);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
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

      setFormError('Failed to create unit. Please try again.');
      toast.error('Failed to create unit. Please try again.');
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
          <DialogTitle>Tambah Unit</DialogTitle>
          <DialogDescription>
            Tambahkan unit baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="unit-name">Unit Name</Label>
            <Input
              id="unit-name"
              {...register('unit_name')}
              placeholder="Masukkan nama unit"
              autoFocus
            />
            {errors.unit_name?.message && (
              <p className="text-sm text-rose-400">
                {errors.unit_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit-code">Unit Code</Label>
            <Input
              id="unit-code"
              {...register('unit_code')}
              placeholder="Masukkan kode unit"
            />
            {errors.unit_code?.message && (
              <p className="text-sm text-rose-400">
                {errors.unit_code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-active">Status</Label>
            <label htmlFor="unit-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="unit-active"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
