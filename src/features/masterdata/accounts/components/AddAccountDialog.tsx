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
import { createAccountInputSchema, type CreateAccountInput } from '../schemas/account.schema';
import { useCreateAccount } from '../hooks/useCreateAccount';

interface AddAccountDialogProps {
  onCreated?: () => void;
}

interface AccountApiErrorResponse {
  message?: string;
  errors?: {
    account_name?: string[];
    account_number?: string[];
    bank_name?: string[];
  };
}

export function AddAccountDialog({ onCreated }: AddAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createAccountMutation = useCreateAccount();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createAccountInputSchema>, unknown, CreateAccountInput>({
    resolver: zodResolver(createAccountInputSchema),
    defaultValues: {
      account_name: '',
      account_number: '',
      bank_name: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  const resetForm = () => {
    reset({ account_name: '', account_number: '', bank_name: '', is_active: true });
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const onSubmit = async (values: CreateAccountInput) => {
    setFormError(null);

    try {
      const result = await createAccountMutation.mutateAsync(values);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
    } catch (error) {
      if (axios.isAxiosError<AccountApiErrorResponse>(error)) {
        const accountNameApiError = error.response?.data?.errors?.account_name?.[0];
        const accountNumberApiError = error.response?.data?.errors?.account_number?.[0];
        const bankNameApiError = error.response?.data?.errors?.bank_name?.[0];

        if (accountNameApiError) {
          setError('account_name', { type: 'server', message: accountNameApiError });
          toast.error(accountNameApiError);
          return;
        }

        if (accountNumberApiError) {
          setError('account_number', { type: 'server', message: accountNumberApiError });
          toast.error(accountNumberApiError);
          return;
        }

        if (bankNameApiError) {
          setError('bank_name', { type: 'server', message: bankNameApiError });
          toast.error(bankNameApiError);
          return;
        }

        const message = error.response?.data?.message;

        if (message) {
          setFormError(message);
          toast.error(message);
          return;
        }
      }

      setFormError('Gagal membuat account. Silakan coba lagi.');
      toast.error('Gagal membuat account. Silakan coba lagi.');
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
          <DialogTitle>Tambah Account</DialogTitle>
          <DialogDescription>
            Tambahkan account baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="account-name">Nama Akun</Label>
            <Input
              id="account-name"
              {...register('account_name')}
              placeholder="Masukkan nama akun"
              autoFocus
            />
            {errors.account_name?.message && (
              <p className="text-sm text-red-600">
                {errors.account_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-number">Nomor Akun</Label>
            <Input
              id="account-number"
              {...register('account_number')}
              placeholder="Masukkan nomor akun"
            />
            {errors.account_number?.message && (
              <p className="text-sm text-red-600">
                {errors.account_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-name">Nama Bank</Label>
            <Input
              id="bank-name"
              {...register('bank_name')}
              placeholder="Masukkan nama bank (opsional)"
            />
            {errors.bank_name?.message && (
              <p className="text-sm text-red-600">
                {errors.bank_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-active">Status</Label>
            <label htmlFor="account-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="account-active"
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
