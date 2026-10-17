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
import { updateWarehouseInputSchema } from '../schemas/warehouse.schema';
import { useUpdateWarehouse } from '../hooks/useUpdateWarehouses';
import type { Warehouse } from '../types/warehouse.types';

interface EditWarehouseDialogProps {
  open: boolean;
  warehouse: Warehouse | null;
  onOpenChange: (open: boolean) => void;
}

interface WarehouseApiErrorResponse {
  message?: string;
  errors?: {
    code?: string[];
    name?: string[];
    location?: string[];
  };
}

export function EditWarehouseDialog({ open, warehouse, onOpenChange }: EditWarehouseDialogProps) {
  const [draft, setDraft] = useState<{ code: string; name: string; location: string; is_active: boolean } | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const updateWarehouseMutation = useUpdateWarehouse();

  const code = draft?.code ?? warehouse?.code ?? '';
  const name = draft?.name ?? warehouse?.name ?? '';
  const location = draft?.location ?? warehouse?.location ?? '';
  const isActive = draft?.is_active ?? warehouse?.is_active ?? true;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraft(null);
      setCodeError(null);
      setNameError(null);
      setLocationError(null);
      setFormError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!warehouse) {
      return;
    }

    setCodeError(null);
    setNameError(null);
    setLocationError(null);
    setFormError(null);

    const parsed = updateWarehouseInputSchema.safeParse({
      code,
      name,
      location,
      is_active: isActive,
    });

    if (!parsed.success) {
      const codeIssue = parsed.error.issues.find((issue) => issue.path.includes('code'));
      const nameIssue = parsed.error.issues.find((issue) => issue.path.includes('name'));
      const locationIssue = parsed.error.issues.find((issue) => issue.path.includes('location'));

      if (codeIssue?.message) {
        setCodeError(codeIssue.message);
      } else if (nameIssue?.message) {
        setNameError(nameIssue.message);
      } else if (locationIssue?.message) {
        setLocationError(locationIssue.message);
      } else {
        setFormError(parsed.error.issues[0]?.message ?? 'Please check your input');
      }

      return;
    }

    try {
      const result = await updateWarehouseMutation.mutateAsync({
        id: warehouse.id,
        data: parsed.data,
      });

      toast.success(result.message);
      setDraft(null);
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError<WarehouseApiErrorResponse>(error)) {
        const codeApiError = error.response?.data?.errors?.code?.[0];
        const nameApiError = error.response?.data?.errors?.name?.[0];
        const locationApiError = error.response?.data?.errors?.location?.[0];

        if (codeApiError) {
          setCodeError(codeApiError);
          toast.error(codeApiError);
          return;
        }

        if (nameApiError) {
          setNameError(nameApiError);
          toast.error(nameApiError);
          return;
        }

        if (locationApiError) {
          setLocationError(locationApiError);
          toast.error(locationApiError);
          return;
        }

        const message = error.response?.data?.message;

        if (message) {
          setFormError(message);
          toast.error(message);
          return;
        }
      }

      setFormError('Failed to update warehouse. Please try again.');
      toast.error('Failed to update warehouse. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Gudang</DialogTitle>
          <DialogDescription>
            Perbarui data gudang yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-warehouse-code">Kode Gudang</Label>
            <Input
              id="edit-warehouse-code"
              value={code}
              onChange={(event) => {
                setDraft((previousDraft) => ({
                  code: event.target.value,
                  name: previousDraft?.name ?? warehouse?.name ?? '',
                  location: previousDraft?.location ?? warehouse?.location ?? '',
                  is_active: previousDraft?.is_active ?? warehouse?.is_active ?? true,
                }));
                setCodeError(null);
                setFormError(null);
              }}
              placeholder="Masukkan kode gudang"
              autoFocus
            />
            {codeError && <p className="text-sm text-rose-400">{codeError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-warehouse-name">Nama Gudang</Label>
            <Input
              id="edit-warehouse-name"
              value={name}
              onChange={(event) => {
                setDraft((previousDraft) => ({
                  code: previousDraft?.code ?? warehouse?.code ?? '',
                  name: event.target.value,
                  location: previousDraft?.location ?? warehouse?.location ?? '',
                  is_active: previousDraft?.is_active ?? warehouse?.is_active ?? true,
                }));
                setNameError(null);
                setFormError(null);
              }}
              placeholder="Masukkan nama gudang"
            />
            {nameError && <p className="text-sm text-rose-400">{nameError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-warehouse-location">Lokasi</Label>
            <Input
              id="edit-warehouse-location"
              value={location}
              onChange={(event) => {
                setDraft((previousDraft) => ({
                  code: previousDraft?.code ?? warehouse?.code ?? '',
                  name: previousDraft?.name ?? warehouse?.name ?? '',
                  location: event.target.value,
                  is_active: previousDraft?.is_active ?? warehouse?.is_active ?? true,
                }));
                setLocationError(null);
                setFormError(null);
              }}
              placeholder="Masukkan lokasi gudang"
            />
            {locationError && <p className="text-sm text-rose-400">{locationError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-warehouse-active">Status</Label>
            <label htmlFor="edit-warehouse-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="edit-warehouse-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) => {
                  setDraft((previousDraft) => ({
                    code: previousDraft?.code ?? warehouse?.code ?? '',
                    name: previousDraft?.name ?? warehouse?.name ?? '',
                    location: previousDraft?.location ?? warehouse?.location ?? '',
                    is_active: event.target.checked,
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
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {formError}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={updateWarehouseMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateWarehouseMutation.isPending || !warehouse}>
              {updateWarehouseMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
