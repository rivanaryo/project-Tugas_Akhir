"use no memo";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { type SubmitHandler } from 'react-hook-form';
import { Button } from '../../../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { MasterdataSearchBar } from '../../../masterdata/components/MasterdataSearchBar';
import { useReferenceTableFilters } from '../../../masterdata/hooks/useReferenceTableFilters';
import { useAccounts } from '../../../masterdata/accounts/hooks/useAccounts';
import { useVendors } from '../../../masterdata/vendors/hooks/useVendors';
import type { Vendor } from '../../../masterdata/vendors/types/vendor.types';
import type { Account } from '../../../masterdata/accounts/types/account.types';
import { usePaymentForm } from '../hooks/useForm';
import { useUpdateVendorPayment } from '../hooks/useUpdateVendorPayment';
import { useVendorPayment } from '../hooks/useVendorPayment';
import type { VendorPaymentFormValues } from '../schemas/VendorPayment.schemas';
import { VENDOR_PAYMENT_STATUS_OPTIONS } from '../constants/vendorPaymentStatus';

interface VendorPaymentApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const formatDateInput = (value: string) => {
  if (!value) return '';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

export function VendorPaymentEditPage() {
  "use no memo";

  const { vendorPaymentId } = useParams();
  const navigate = useNavigate();
  const updateMutation = useUpdateVendorPayment();
  const [formError, setFormError] = useState<string | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const { data: vendorPayment, isLoading: isHeadLoading, isError: isHeadError } = useVendorPayment(vendorPaymentId);

  const vendorFilters = useReferenceTableFilters(10);
  const { data: vendorsData, isLoading: isVendorsLoading, isFetching: isVendorsFetching } = useVendors({
    page: vendorFilters.page,
    perPage: vendorFilters.perPage,
    filters: vendorFilters.queryFilters,
  });

  const accountFilters = useReferenceTableFilters(10);
  const { data: accountsData, isLoading: isAccountsLoading, isFetching: isAccountsFetching } = useAccounts({
    page: accountFilters.page,
    perPage: accountFilters.perPage,
    filters: accountFilters.queryFilters,
  });

  const vendors = useMemo(() => vendorsData?.items ?? [], [vendorsData?.items]);
  const vendorsMeta = vendorsData?.meta;

  const accounts = useMemo(() => accountsData?.items ?? [], [accountsData?.items]);
  const accountsMeta = accountsData?.meta;

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = usePaymentForm();

  const selectedVendorId = watch('vendor_id');
  const selectedAccountId = watch('account_id');

  useEffect(() => {
    if (!vendorPayment) return;
    reset({
      vendor_id: String(vendorPayment.vendor_id ?? ''),
      vendor_invoice_number: vendorPayment.vendor_invoice_number ?? '',
      payment_number: vendorPayment.payment_number ?? '',
      payment_type: vendorPayment.payment_type ?? 'transfer',
      status: vendorPayment.status ?? 'unpaid',
      payment_date: formatDateInput(vendorPayment.payment_date),
      total_paid: String(vendorPayment.total_paid ?? ''),
      account_id: String(vendorPayment.account_id ?? ''),
    });
  }, [vendorPayment, reset]);

  const selectedVendor = useMemo<Vendor | null>(() => {
    if (!selectedVendorId) return null;
    return vendors.find((vendor) => String(vendor.id) === String(selectedVendorId)) ?? null;
  }, [vendors, selectedVendorId]);

  const selectedAccount = useMemo<Account | null>(() => {
    if (!selectedAccountId) return null;
    return accounts.find((account) => String(account.id) === String(selectedAccountId)) ?? null;
  }, [accounts, selectedAccountId]);

  const vendorName = useMemo(() => {
    if (selectedVendor) return `${selectedVendor.vendor_name} (${selectedVendor.contact_person || '-'}),`;
    const fromPayload = vendorPayment?.vendor;
    if (fromPayload?.vendor_name) {
      return `${fromPayload.vendor_name}`;
    }
    return selectedVendorId ? `Vendor ${selectedVendorId}` : '';
  }, [selectedVendor?.vendor_name, selectedVendor?.contact_person, vendorPayment?.vendor?.vendor_name, selectedVendorId]);

  const accountName = useMemo(() => {
    if (selectedAccount) return `${selectedAccount.account_name} (${selectedAccount.account_number})`;
    const fromPayload = vendorPayment?.account;
    if (fromPayload?.account_name) {
      const suffix = fromPayload.account_number ? ` (${fromPayload.account_number})` : '';
      return `${fromPayload.account_name}${suffix}`;
    }
    return selectedAccountId ? `Account ${selectedAccountId}` : '';
  }, [selectedAccount, vendorPayment?.account, selectedAccountId]);

  const visibleVendors = useMemo(() => {
    const query = vendorFilters.q.trim().toLowerCase();
    if (!query) return vendors;

    return vendors.filter((vendor) => {
      const haystack = [vendor.vendor_name, String(vendor.id)].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [vendors, vendorFilters.q]);

  const visibleAccounts = useMemo(() => {
    const query = accountFilters.q.trim().toLowerCase();
    if (!query) return accounts;

    return accounts.filter((account) => {
      const haystack = [account.account_name, account.account_number].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [accounts, accountFilters.q]);

  const handleChooseVendor = (vendor: Vendor) => {
    setValue('vendor_id', String(vendor.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('vendor_id');
    setIsVendorModalOpen(false);
  };

  const handleChooseAccount = (account: Account) => {
    setValue('account_id', String(account.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('account_id');
    setIsAccountModalOpen(false);
  };

  const canGoPrevVendors = Boolean(vendorsMeta?.hasPrevPage) && !isVendorsFetching;
  const canGoNextVendors = Boolean(vendorsMeta?.hasNextPage) && !isVendorsFetching;
  const canGoPrevAccounts = Boolean(accountsMeta?.hasPrevPage) && !isAccountsFetching;
  const canGoNextAccounts = Boolean(accountsMeta?.hasNextPage) && !isAccountsFetching;

  const onSubmit: SubmitHandler<VendorPaymentFormValues> = async (payload) => {
    if (!vendorPaymentId) return;

    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: vendorPaymentId, data: payload });
      toast.success('Pembayaran vendor berhasil diperbarui.');
      navigate(`/finance/vendor-payments/${vendorPaymentId}`);
    } catch (error) {
      if (axios.isAxiosError<VendorPaymentApiErrorResponse>(error)) {
        const apiMessage = error.response?.data?.message;
        if (apiMessage) {
          setFormError(apiMessage);
          toast.error(apiMessage);
          return;
        }
      }
      const fallbackMessage = 'Gagal memperbarui pembayaran vendor. Silakan coba lagi.';
      setFormError(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/inventory/purchase-orders">Purchase</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/finance/vendor-payments">Vendor Payments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Edit Pembayaran Vendor</CardTitle>
            <CardDescription>Ubah informasi pembayaran vendor. Nomor pembayaran tidak bisa diubah.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isHeadError ? (
            <p className="text-sm text-rose-400">Gagal memuat data pembayaran vendor.</p>
          ) : isHeadLoading || !vendorPayment ? (
            <p className="text-sm text-text">Loading vendor payment...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...register('vendor_id')} />
              <input type="hidden" {...register('account_id')} />
              <input type="hidden" {...register('payment_number')} />

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-2/40 p-6">
                  <div>
                    <Label htmlFor="payment_number">Nomor Pembayaran</Label>
                    <Input id="payment_number" value={vendorPayment.payment_number} disabled />
                  </div>

                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <div className="flex gap-2">
                      <Input id="vendor" value={vendorName} readOnly placeholder="Pilih vendor" />
                      <Button type="button" onClick={() => setIsVendorModalOpen(true)}>
                        Pilih Vendor
                      </Button>
                    </div>
                    {errors.vendor_id?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.vendor_id.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="vendor_invoice_number">Nomor Invoice Vendor</Label>
                    <Input id="vendor_invoice_number" placeholder="INV-001/2024" {...register('vendor_invoice_number')} />
                    {errors.vendor_invoice_number?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.vendor_invoice_number.message}</p>
                    ) : null}
                  </div>  

                  <div>
                    <Label htmlFor="payment_type">Tipe Pembayaran</Label>
                    <Select id="payment_type" {...register('payment_type')} value={watch('payment_type') || 'transfer'}>
                      <option value="transfer">Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="giro">Giro</option>
                      <option value="downpayment">Down Payment</option>
                    </Select>
                    {errors.payment_type?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.payment_type.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="status">Status Pembayaran</Label>
                    <Select id="status" {...register('status')} value={watch('status') || 'unpaid'}>
                      {VENDOR_PAYMENT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    {errors.status?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="payment_date">Tanggal Pembayaran</Label>
                    <Input id="payment_date" type="date" {...register('payment_date')} />
                    {errors.payment_date?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.payment_date.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="total_paid">Total Bayar</Label>
                    <Input id="total_paid" type="number" step="0.01" placeholder="0.00" {...register('total_paid')} />
                    {errors.total_paid?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.total_paid.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="account">Akun Pembayaran</Label>
                    <div className="flex gap-2">
                      <Input id="account" value={accountName} readOnly placeholder="Pilih akun pembayaran" />
                      <Button type="button" onClick={() => setIsAccountModalOpen(true)}>
                        Pilih Akun
                      </Button>
                    </div>
                    {errors.account_id?.message ? (
                      <p className="mt-1 text-sm text-destructive">{errors.account_id.message}</p>
                    ) : null}
                  </div>

                  {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ringkasan Pembayaran</CardTitle>
                      <CardDescription>Pastikan data pembayaran sudah benar sebelum menyimpan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 text-sm text-text">
                        <div className="flex items-center justify-between">
                          <span>Vendor</span>
                          <strong>{vendorName || '-'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Invoice</span>
                          <strong>{watch('vendor_invoice_number') || '-'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tipe Pembayaran</span>
                          <strong>{watch('payment_type') || '-'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <strong>{watch('status') || '-'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tanggal</span>
                          <strong>{watch('payment_date') || '-'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total Bayar</span>
                          <strong>Rp {watch('total_paid') || '0'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Akun</span>
                          <strong>{accountName || '-'}</strong>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => navigate(`/finance/vendor-payments/${vendorPaymentId}`)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || updateMutation.isPending || !isValid}>
                  {isSubmitting || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>

              <Dialog open={isVendorModalOpen} onOpenChange={(open) => setIsVendorModalOpen(open)}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Pilih Vendor</DialogTitle>
                    <DialogDescription>Pilih vendor untuk pembayaran.</DialogDescription>
                  </DialogHeader>

                  <MasterdataSearchBar
                    value={vendorFilters.q}
                    onChange={vendorFilters.updateSearch}
                    onReset={vendorFilters.resetFilters}
                    placeholder="Cari nama vendor atau kode"
                    isLoading={isVendorsLoading || isVendorsFetching}
                    variant="compact"
                  />

                  <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-border/80">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-surface-2">
                        <tr>
                          <th className="px-4 py-3">ID Vendor</th>
                          <th className="px-4 py-3">Nama Vendor</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isVendorsLoading ? (
                          <tr>
                            <td className="px-4 py-4" colSpan={4}>
                              Loading vendors...
                            </td>
                          </tr>
                        ) : visibleVendors.length === 0 ? (
                          <tr>
                            <td className="px-4 py-4" colSpan={4}>
                              Tidak ada vendor.
                            </td>
                          </tr>
                        ) : (
                          visibleVendors.map((vendor) => (
                            <tr key={vendor.id} className="border-t border-border/70">
                              <td className="px-4 py-3">{vendor.id}</td>
                              <td className="px-4 py-3">{vendor.vendor_name}</td>
                              <td className="px-4 py-3">{vendor.is_active ? 'Active' : 'Inactive'}</td>
                              <td className="px-4 py-3 text-right">
                                <Button type="button" size="sm" onClick={() => handleChooseVendor(vendor)}>
                                  Pilih
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <DialogFooter>
                    <div className="mr-auto flex items-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => vendorFilters.setPage(vendorFilters.page - 1)} disabled={!canGoPrevVendors}>
                        Sebelumnya
                      </Button>
                      <span className="text-xs text-text">
                        Halaman {vendorsMeta?.currentPage ?? vendorFilters.page} / {vendorsMeta?.lastPage ?? 1}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => vendorFilters.setPage(Math.min(vendorsMeta?.lastPage ?? vendorFilters.page + 1, vendorFilters.page + 1))}
                        disabled={!canGoNextVendors}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => setIsVendorModalOpen(false)}>
                      Tutup
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAccountModalOpen} onOpenChange={(open) => setIsAccountModalOpen(open)}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Pilih Akun Pembayaran</DialogTitle>
                    <DialogDescription>Pilih akun untuk pembayaran vendor.</DialogDescription>
                  </DialogHeader>

                  <MasterdataSearchBar
                    value={accountFilters.q}
                    onChange={accountFilters.updateSearch}
                    onReset={accountFilters.resetFilters}
                    placeholder="Cari nama akun atau kode"
                    isLoading={isAccountsLoading || isAccountsFetching}
                    variant="compact"
                  />

                  <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-border/80">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-surface-2">
                        <tr>
                          <th className="px-4 py-3">Nomor Akun</th>
                          <th className="px-4 py-3">Nama Akun</th>
                          <th className="px-4 py-3">Bank</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isAccountsLoading ? (
                          <tr>
                            <td className="px-4 py-4" colSpan={4}>
                              Loading accounts...
                            </td>
                          </tr>
                        ) : visibleAccounts.length === 0 ? (
                          <tr>
                            <td className="px-4 py-4" colSpan={4}>
                              Tidak ada akun.
                            </td>
                          </tr>
                        ) : (
                          visibleAccounts.map((account) => (
                            <tr key={account.id} className="border-t border-border/70">
                              <td className="px-4 py-3">{account.account_number}</td>
                              <td className="px-4 py-3">{account.account_name}</td>
                              <td className="px-4 py-3">{account.bank_name ?? '-'}</td>
                              <td className="px-4 py-3 text-right">
                                <Button type="button" size="sm" onClick={() => handleChooseAccount(account)}>
                                  Pilih
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <DialogFooter>
                    <div className="mr-auto flex items-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => accountFilters.setPage(accountFilters.page - 1)} disabled={!canGoPrevAccounts}>
                        Sebelumnya
                      </Button>
                      <span className="text-xs text-text">
                        Halaman {accountsMeta?.currentPage ?? accountFilters.page} / {accountsMeta?.lastPage ?? 1}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => accountFilters.setPage(Math.min(accountsMeta?.lastPage ?? accountFilters.page + 1, accountFilters.page + 1))}
                        disabled={!canGoNextAccounts}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => setIsAccountModalOpen(false)}>
                      Tutup
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
