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
import { createWarehouseInputSchema } from '../schemas/warehouse.schema';
import { useCreateWarehouse } from '../hooks/useCreateWarehouse';

interface AddWarehouseDialogProps {
  onCreated?: () => void;
}

interface WarehouseApiErrorResponse {
  message?: string;
  errors?: {
    code?: string[];
    name?: string[];
    location?: string[];
  };
}

export function AddWarehouseDialog({ onCreated }: AddWarehouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const createWarehouseMutation = useCreateWarehouse();

  const resetForm = () => {
    setCode('');
    setName('');
    setLocation('');
    setIsActive(true);
    setCodeError(null);
    setNameError(null);
    setLocationError(null);
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
    setCodeError(null);
    setNameError(null);
    setLocationError(null);
    setFormError(null);

    const parsed = createWarehouseInputSchema.safeParse({
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
        const firstError = parsed.error.issues[0]?.message ?? 'Please check your input';
        setFormError(firstError);
      }

      return;
    }

    try {
      const result = await createWarehouseMutation.mutateAsync(parsed.data);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
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

      setFormError('Failed to create warehouse. Please try again.');
      toast.error('Failed to create warehouse. Please try again.');
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
          <DialogTitle>Tambah Gudang</DialogTitle>
          <DialogDescription>
            Tambahkan gudang baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="warehouse-code">Kode Gudang</Label>
            <Input
              id="warehouse-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setCodeError(null);
              }}
              placeholder="Masukkan kode gudang (contoh: WH-001)"
              autoFocus
            />
            {codeError && (
              <p className="text-sm text-rose-400">
                {codeError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-name">Nama Gudang</Label>
            <Input
              id="warehouse-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(null);
              }}
              placeholder="Masukkan nama gudang"
            />
            {nameError && (
              <p className="text-sm text-rose-400">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-location">Lokasi</Label>
            <Input
              id="warehouse-location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setLocationError(null);
              }}
              placeholder="Masukkan lokasi gudang"
            />
            {locationError && (
              <p className="text-sm text-rose-400">
                {locationError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-active">Status</Label>
            <label htmlFor="warehouse-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="warehouse-active"
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
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {formError}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={createWarehouseMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createWarehouseMutation.isPending}>
              {createWarehouseMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
