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
import { updateCustomerInputSchema, type UpdateCustomerInput } from '../schemas/customer.schema';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import type { Customer } from '../types/customer.types';

interface EditCustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
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

export function EditCustomerDialog({ open, customer, onOpenChange }: EditCustomerDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const updateCustomerMutation = useUpdateCustomer();

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
  } = useForm<z.input<typeof updateCustomerInputSchema>, unknown, UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerInputSchema),
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

  useEffect(() => {
    if (!open || !customer) {
      return;
    }

    reset({
      customer_name: customer.customer_name,
      contact_person: customer.contact_person ?? '',
      phone_number: customer.phone_number ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      is_active: customer.is_active,
    });
  }, [open, customer, reset]);

  const onSubmit = async (values: UpdateCustomerInput) => {
    if (!customer) {
      return;
    }

    setFormError(null);

    try {
      const result = await updateCustomerMutation.mutateAsync({
        id: customer.id,
        data: values,
      });

      toast.success(result.message);
      onOpenChange(false);
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

      setFormError('Gagal memperbarui customer. Silakan coba lagi.');
      toast.error('Gagal memperbarui customer. Silakan coba lagi.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Perbarui data customer yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="edit-customer-name">Nama Customer</Label>
            <Input
              id="edit-customer-name"
              {...register('customer_name')}
              placeholder="Masukkan nama customer"
              autoFocus
            />
            {errors.customer_name?.message && <p className="text-sm text-rose-400">{errors.customer_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customer-contact-person">Kontak Person</Label>
            <Input
              id="edit-customer-contact-person"
              {...register('contact_person')}
              placeholder="Masukkan kontak person (opsional)"
            />
            {errors.contact_person?.message && <p className="text-sm text-rose-400">{errors.contact_person.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customer-phone-number">Nomor Telepon</Label>
            <Input
              id="edit-customer-phone-number"
              {...register('phone_number')}
              placeholder="Masukkan nomor telepon (opsional)"
            />
            {errors.phone_number?.message && <p className="text-sm text-rose-400">{errors.phone_number.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customer-email">Email</Label>
            <Input
              id="edit-customer-email"
              type="email"
              {...register('email')}
              placeholder="Masukkan email (opsional)"
            />
            {errors.email?.message && <p className="text-sm text-rose-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customer-address">Alamat</Label>
            <Input
              id="edit-customer-address"
              {...register('address')}
              placeholder="Masukkan alamat (opsional)"
            />
            {errors.address?.message && <p className="text-sm text-rose-400">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-customer-active">Status</Label>
            <label htmlFor="edit-customer-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="edit-customer-active"
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
            <Button type="submit" disabled={isSubmitting || !customer}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
