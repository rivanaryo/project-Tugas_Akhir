"use no memo";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { useVendors } from '../../../masterdata/vendors/hooks/useVendors';
import type { Vendor } from '../../../masterdata/vendors/types/vendor.types';
import { PurchaseOrderItemsTable } from '../components/PurchaseOrderItemsTable';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';
import { usePurchaseOrderItems } from '../hooks/usePurchaseOrderItems';
import { useUpdatePurchaseOrder } from '../hooks/useUpdatePurchaseOrder';
import { updatePurchaseOrderHeadInputSchema, type UpdatePurchaseOrderHeadInput } from '../schemas/purchaseOrder.schema';

interface PurchaseOrderApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const formatDate = (value: string) => {
  if (!value) return '';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

const formatMoney = (value: string | number | null | undefined) => {
  const numberValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = numberValue !== null && numberValue !== undefined && Number.isFinite(numberValue) ? numberValue : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export function EditPurchaseOrderPage() {
  "use no memo";

  const { purchaseOrderId } = useParams();
  const navigate = useNavigate();
  const updateMutation = useUpdatePurchaseOrder();

  const [formError, setFormError] = useState<string | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const vendorFilters = useReferenceTableFilters(10);

  const { data: purchaseOrder, isLoading: isHeadLoading, isError: isHeadError } = usePurchaseOrder(purchaseOrderId);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError } = usePurchaseOrderItems({
    purchaseOrderId,
    page: 1,
    perPage: 100,
  });

  const items = itemsData?.items ?? [];

  const computedTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const explicitTotal = item.total_price;
      const explicitTotalNumber = explicitTotal !== null && explicitTotal !== undefined ? Number(explicitTotal) : NaN;
      if (Number.isFinite(explicitTotalNumber)) return total + explicitTotalNumber;

      const qty = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unit_price ?? 0);
      const taxAmount = Number(item.tax_amount ?? 0);
      
      const safeQty = Number.isFinite(qty) ? qty : 0;
      const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
      const safeTaxAmount = Number.isFinite(taxAmount) ? taxAmount : 0;
      
      const subtotal = safeQty * safeUnitPrice;
      return total + subtotal + safeTaxAmount;
    }, 0);
  }, [items]);

  const totalPrice = purchaseOrder?.total_price ?? computedTotal;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePurchaseOrderHeadInput>({
    resolver: zodResolver(updatePurchaseOrderHeadInputSchema),
    defaultValues: {
      vendor_id: '',
      status: 'draft',
      po_date: '',
    },
  });

  const vendorId = useWatch({ control, name: 'vendor_id', defaultValue: '' });

  const { data: vendorsData, isLoading: isVendorsLoading, isFetching: isVendorsFetching } = useVendors({
    page: vendorFilters.page,
    perPage: vendorFilters.perPage,
    filters: vendorFilters.queryFilters,
  });

  const vendors = vendorsData?.items ?? [];
  const vendorsMeta = vendorsData?.meta;

  const visibleVendors = useMemo(() => {
    const q = vendorFilters.q.trim().toLowerCase();
    if (!q) return vendors;

    return vendors.filter((vendor) => {
      const haystack = [
        vendor.vendor_name,
        vendor.contact_person ?? '',
        vendor.phone_number ?? '',
        vendor.email ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [vendors, vendorFilters.q]);

  useEffect(() => {
    if (!purchaseOrder) return;

    reset({
      vendor_id: String(purchaseOrder.vendor_id),
      status: purchaseOrder.status,
      po_date: formatDate(purchaseOrder.po_date),
    });
  }, [purchaseOrder, reset]);

  const selectedVendorLabel = useMemo(() => {
    const fromPage = vendors.find((item) => String(item.id) === String(vendorId));
    if (fromPage) return fromPage.vendor_name;
    return purchaseOrder?.vendor?.vendor_name ?? '';
  }, [vendors, vendorId, purchaseOrder?.vendor?.vendor_name]);

  const canGoVendorPrev = Boolean(vendorsMeta?.hasPrevPage) && !isVendorsFetching;
  const canGoVendorNext = Boolean(vendorsMeta?.hasNextPage) && !isVendorsFetching;

  const handleSelectVendor = (vendor: Vendor) => {
    setValue('vendor_id', String(vendor.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('vendor_id');
    setIsVendorModalOpen(false);
  };

  const onSubmit = async (values: UpdatePurchaseOrderHeadInput) => {
    if (!purchaseOrderId) return;

    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: purchaseOrderId, data: values });
      toast.success('Purchase Order berhasil diperbarui');
      navigate(`/inventory/purchase-orders/${purchaseOrderId}`);
    } catch (error) {
      if (axios.isAxiosError<PurchaseOrderApiErrorResponse>(error)) {
        const apiMessage = error.response?.data?.message;
        if (apiMessage) {
          setFormError(apiMessage);
          toast.error(apiMessage);
          return;
        }
      }

      const fallbackMessage = 'Gagal memperbarui Purchase Order. Silakan coba lagi.';
      setFormError(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
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
                <Link to="/inventory/purchase-orders">Purchase Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Edit Purchase Order</CardTitle>
          <CardDescription>Ubah data head Purchase Order. Nomor PO tidak bisa diubah.</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isHeadError ? (
          <p className="text-sm text-rose-400">Gagal memuat data purchase order.</p>
        ) : isHeadLoading || !purchaseOrder ? (
          <p className="text-sm text-text">Loading purchase order...</p>
        ) : (
          <>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-text-h">Head</p>
                  <p className="text-sm text-text">Informasi utama Purchase Order</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="po-number">Nomor PO</Label>
                    <Input id="po-number" value={purchaseOrder.po_number} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="po-date">Tanggal PO</Label>
                    <Input id="po-date" type="date" {...register('po_date')} />
                    {errors.po_date?.message && <p className="text-sm text-rose-400">{errors.po_date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Vendor</Label>
                    <div className="flex gap-2">
                      <Input value={selectedVendorLabel} placeholder="Pilih vendor" readOnly />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsVendorModalOpen(true)}
                      >
                        Pilih
                      </Button>
                    </div>
                    <input type="hidden" {...register('vendor_id')} />
                    {errors.vendor_id?.message && <p className="text-sm text-rose-400">{errors.vendor_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="po-status">Status</Label>
                    <Select id="po-status" {...register('status')}>
                      <option value="draft">Draft</option>
                      <option value="approved">Approved</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                    {errors.status?.message && <p className="text-sm text-rose-400">{errors.status.message}</p>}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-text-h">Purchase Order Items</p>
                  <p className="text-sm text-text">Daftar item (read only)</p>
                </div>

                <PurchaseOrderItemsTable
                  data={items}
                  isLoading={isItemsLoading}
                  isError={isItemsError}
                  rowStartNumber={itemsData?.meta.from ?? 1}
                />
              </section>

              <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-h">Total</p>
                    <p className="text-sm text-text">Total harga Purchase Order</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text">Total Price</p>
                    <p className="metric-number text-2xl font-semibold text-text-h">{formatMoney(totalPrice)}</p>
                  </div>
                </div>
              </section>

              {formError && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{formError}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => navigate(`/inventory/purchase-orders/${purchaseOrderId}`)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
                  {isSubmitting || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>

            <Dialog
              open={isVendorModalOpen}
              onOpenChange={(open) => {
                setIsVendorModalOpen(open);
                if (open) vendorFilters.setPage(1);
              }}
            >
              <DialogContent className="max-w-none">
                <DialogHeader>
                  <DialogTitle>Pilih Vendor</DialogTitle>
                  <DialogDescription>Pilih vendor dari tabel referensi.</DialogDescription>
                </DialogHeader>

                <MasterdataSearchBar
                  value={vendorFilters.q}
                  onChange={vendorFilters.updateSearch}
                  onReset={vendorFilters.resetFilters}
                  isLoading={isVendorsLoading || isVendorsFetching}
                  placeholder="Cari vendor, kontak, email, atau telepon"
                  variant="compact"
                />

                <div className="max-h-[55vh] overflow-auto rounded-xl border border-border/80">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-surface-2">
                      <tr>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isVendorsLoading ? (
                        <tr>
                          <td className="px-4 py-4" colSpan={6}>
                            Loading vendors...
                          </td>
                        </tr>
                      ) : visibleVendors.length === 0 ? (
                        <tr>
                          <td className="px-4 py-4" colSpan={6}>
                            Tidak ada data vendor.
                          </td>
                        </tr>
                      ) : (
                        visibleVendors.map((vendor) => (
                          <tr key={vendor.id} className="border-t border-border/70">
                            <td className="px-4 py-3">{vendor.vendor_name}</td>
                            <td className="px-4 py-3">{vendor.contact_person ?? '-'}</td>
                            <td className="px-4 py-3">{vendor.phone_number ?? '-'}</td>
                            <td className="px-4 py-3">{vendor.email ?? '-'}</td>
                            <td className="px-4 py-3">{vendor.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
                            <td className="px-4 py-3 text-right">
                              <Button type="button" size="sm" onClick={() => handleSelectVendor(vendor)}>
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
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => vendorFilters.setPage(vendorFilters.page - 1)}
                      disabled={!canGoVendorPrev}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-xs text-text">
                      Halaman {vendorsMeta?.currentPage ?? vendorFilters.page} / {vendorsMeta?.lastPage ?? 1}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        vendorFilters.setPage(
                          Math.min(vendorsMeta?.lastPage ?? vendorFilters.page + 1, vendorFilters.page + 1)
                        )
                      }
                      disabled={!canGoVendorNext}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
