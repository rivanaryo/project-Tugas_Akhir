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
import { createVendorInputSchema, type CreateVendorInput } from '../schemas/vendor.schema';
import { useCreateVendor } from '../hooks/useCreateVendor';

interface AddVendorDialogProps {
  onCreated?: () => void;
}

interface VendorApiErrorResponse {
  message?: string;
  errors?: {
    vendor_name?: string[];
    contact_person?: string[];
    phone_number?: string[];
    email?: string[];
    address?: string[];
  };
}

export function AddVendorDialog({ onCreated }: AddVendorDialogProps) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createVendorMutation = useCreateVendor();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createVendorInputSchema>, unknown, CreateVendorInput>({
    resolver: zodResolver(createVendorInputSchema),
    defaultValues: {
      vendor_name: '',
      contact_person: '',
      phone_number: '',
      email: '',
      address: '',
      is_active: true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

  const resetForm = () => {
    reset({ vendor_name: '', contact_person: '', phone_number: '', email: '', address: '', is_active: true });
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const onSubmit = async (values: CreateVendorInput) => {
    setFormError(null);

    try {
      const result = await createVendorMutation.mutateAsync(values);
      toast.success(result.message);
      onCreated?.();
      setOpen(false);
      resetForm();
    } catch (error) {
      if (axios.isAxiosError<VendorApiErrorResponse>(error)) {
        const vendorNameApiError = error.response?.data?.errors?.vendor_name?.[0];
        const contactPersonApiError = error.response?.data?.errors?.contact_person?.[0];
        const phoneNumberApiError = error.response?.data?.errors?.phone_number?.[0];
        const emailApiError = error.response?.data?.errors?.email?.[0];
        const addressApiError = error.response?.data?.errors?.address?.[0];

        if (vendorNameApiError) {
          setError('vendor_name', { type: 'server', message: vendorNameApiError });
          toast.error(vendorNameApiError);
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

      setFormError('Failed to create vendor. Please try again.');
      toast.error('Failed to create vendor. Please try again.');
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
          <DialogTitle>Tambah Vendor</DialogTitle>
          <DialogDescription>
            Tambahkan vendor baru untuk master data.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              {...register('vendor_name')}
              placeholder="Masukkan nama vendor"
              autoFocus
            />
            {errors.vendor_name?.message && (
              <p className="text-sm text-red-600">
                {errors.vendor_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-contact-person">Contact Person</Label>
            <Input
              id="vendor-contact-person"
              {...register('contact_person')}
              placeholder="Masukkan contact person (opsional)"
            />
            {errors.contact_person?.message && (
              <p className="text-sm text-red-600">
                {errors.contact_person.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-phone-number">Phone Number</Label>
            <Input
              id="vendor-phone-number"
              {...register('phone_number')}
              placeholder="Masukkan nomor telepon (opsional)"
            />
            {errors.phone_number?.message && (
              <p className="text-sm text-red-600">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-email">Email</Label>
            <Input
              id="vendor-email"
              type="email"
              {...register('email')}
              placeholder="Masukkan email (opsional)"
            />
            {errors.email?.message && (
              <p className="text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-address">Address</Label>
            <Input
              id="vendor-address"
              {...register('address')}
              placeholder="Masukkan alamat (opsional)"
            />
            {errors.address?.message && (
              <p className="text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-active">Status</Label>
            <label htmlFor="vendor-active" className="flex items-center gap-2 text-sm text-text-h">
              <input
                id="vendor-active"
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
