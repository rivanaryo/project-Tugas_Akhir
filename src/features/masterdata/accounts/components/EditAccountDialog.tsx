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
import { updateAccountInputSchema, type UpdateAccountInput } from '../schemas/account.schema';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import type { Account } from '../types/account.types';

interface EditAccountDialogProps {
  open: boolean;
  account: Account | null;
  onOpenChange: (open: boolean) => void;
}

interface AccountApiErrorResponse {
  message?: string;
  errors?: {
    account_name?: string[];
    account_number?: string[];
    bank_name?: string[];
  };
}

export function EditAccountDialog({ open, account, onOpenChange }: EditAccountDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const updateAccountMutation = useUpdateAccount();

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
  } = useForm<z.input<typeof updateAccountInputSchema>, unknown, UpdateAccountInput>({
    resolver: zodResolver(updateAccountInputSchema),
    defaultValues: {
      account_name: '',
      account_number: '',
      bank_name: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  useEffect(() => {
    if (!open || !account) {
      return;
    }

    reset({
      account_name: account.account_name,
      account_number: account.account_number,
      bank_name: account.bank_name ?? '',
      is_active: account.is_active,
    });
  }, [open, account, reset]);

  const onSubmit = async (values: UpdateAccountInput) => {
    if (!account) {
      return;
    }

    setFormError(null);

    try {
      const result = await updateAccountMutation.mutateAsync({
        id: account.id,
        data: values,
      });

      toast.success(result.message);
      onOpenChange(false);
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

      setFormError('Gagal memperbarui account. Silakan coba lagi.');
      toast.error('Gagal memperbarui account. Silakan coba lagi.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Perbarui data account yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="edit-account-name">Nama Akun</Label>
            <Input
              id="edit-account-name"
              {...register('account_name')}
              placeholder="Masukkan nama akun"
              autoFocus
            />
            {errors.account_name?.message && <p className="text-sm text-red-600">{errors.account_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-account-number">Nomor Akun</Label>
            <Input
              id="edit-account-number"
              {...register('account_number')}
              placeholder="Masukkan nomor akun"
            />
            {errors.account_number?.message && <p className="text-sm text-red-600">{errors.account_number.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bank-name">Nama Bank</Label>
            <Input
              id="edit-bank-name"
              {...register('bank_name')}
              placeholder="Masukkan nama bank (opsional)"
            />
            {errors.bank_name?.message && <p className="text-sm text-red-600">{errors.bank_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-account-active">Status</Label>
            <label htmlFor="edit-account-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="edit-account-active"
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
            <Button type="submit" disabled={isSubmitting || !account}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
