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
import { createCustomerInputSchema, type CreateCustomerInput } from '../schemas/customer.schema';
import { useCreateCustomer } from '../hooks/useCreateCustomer';

interface AddCustomerDialogProps {
  onCreated?: () => void;
}

interface CustomerApiErrorResponse {
  message?: string;
  errors?: {
    customer_name?: string[];
    contact_person?: string[];
    phone_number?: string[];
    email?: string[];
    address?: string[];
  };
}

export function AddCustomerDialog({ onCreated }: AddCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createCustomerMutation = useCreateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createCustomerInputSchema>, unknown, CreateCustomerInput>({
    resolver: zodResolver(createCustomerInputSchema),
    defaultValues: {
      customer_name: '',
      contact_person: '',
      phone_number: '',
      email: '',
      address: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  const resetForm = () => {
    reset({ customer_name: '', contact_person: '', phone_number: '', email: '', address: '', is_active: true });
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const onSubmit = async (values: CreateCustomerInput) => {
    setFormError(null);

    try {
      const result = await createCustomerMutation.mutateAsync(values);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
    } catch (error) {
      if (axios.isAxiosError<CustomerApiErrorResponse>(error)) {
        const customerNameApiError = error.response?.data?.errors?.customer_name?.[0];
        const contactPersonApiError = error.response?.data?.errors?.contact_person?.[0];
        const phoneNumberApiError = error.response?.data?.errors?.phone_number?.[0];
        const emailApiError = error.response?.data?.errors?.email?.[0];
        const addressApiError = error.response?.data?.errors?.address?.[0];

        if (customerNameApiError) {
          setError('customer_name', { type: 'server', message: customerNameApiError });
          toast.error(customerNameApiError);
          return;
        }

        if (contactPersonApiError) {
          setError('contact_person', { type: 'server', message: contactPersonApiError });
          toast.error(contactPersonApiError);
          return;
        }

        if (phoneNumberApiError) {
          setError('phone_number', { type: 'server', message: phoneNumberApiError });
          toast.error(phoneNumberApiError);
          return;
        }

        if (emailApiError) {
          setError('email', { type: 'server', message: emailApiError });
          toast.error(emailApiError);
          return;
        }

        if (addressApiError) {
          setError('address', { type: 'server', message: addressApiError });
          toast.error(addressApiError);
          return;
        }

        const message = error.response?.data?.message;

        if (message) {
          setFormError(message);
          toast.error(message);
          return;
        }
      }

      setFormError('Gagal membuat customer. Silakan coba lagi.');
      toast.error('Gagal membuat customer. Silakan coba lagi.');
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
          <DialogTitle>Tambah Customer</DialogTitle>
          <DialogDescription>
            Tambahkan customer baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nama Customer</Label>
            <Input
              id="customer-name"
              {...register('customer_name')}
              placeholder="Masukkan nama customer"
              autoFocus
            />
            {errors.customer_name?.message && (
              <p className="text-sm text-rose-400">
                {errors.customer_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-contact-person">Kontak Person</Label>
            <Input
              id="customer-contact-person"
              {...register('contact_person')}
              placeholder="Masukkan kontak person (opsional)"
            />
            {errors.contact_person?.message && (
              <p className="text-sm text-rose-400">
                {errors.contact_person.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone-number">Nomor Telepon</Label>
            <Input
              id="customer-phone-number"
              {...register('phone_number')}
              placeholder="Masukkan nomor telepon (opsional)"
            />
            {errors.phone_number?.message && (
              <p className="text-sm text-rose-400">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              {...register('email')}
              placeholder="Masukkan email (opsional)"
            />
            {errors.email?.message && (
              <p className="text-sm text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-address">Alamat</Label>
            <Input
              id="customer-address"
              {...register('address')}
              placeholder="Masukkan alamat (opsional)"
            />
            {errors.address?.message && (
              <p className="text-sm text-rose-400">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-active">Status</Label>
            <label htmlFor="customer-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="customer-active"
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
