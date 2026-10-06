"use no memo";

import { useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useHorizontalScroll } from '../../../../hooks/useHorizontalScroll';
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
import { MasterdataSearchBar } from '../../../masterdata/components/MasterdataSearchBar';
import { useReferenceTableFilters } from '../../../masterdata/hooks/useReferenceTableFilters';
import { useVendors } from '../../../masterdata/vendors/hooks/useVendors';
import type { Vendor } from '../../../masterdata/vendors/types/vendor.types';
import { useProducts } from '../../../masterdata/items/hooks/useProducts';
import type { Product } from '../../../masterdata/items/types/product.types';
import { usePricelists } from '../../../masterdata/pricelists/hooks/usePricelists';
import type { Pricelist } from '../../../masterdata/pricelists/types/pricelist.types';
import { useCreatePurchaseOrder } from '../hooks/useCreatePurchaseOrder';
import { createPurchaseOrderFormSchema, type CreatePurchaseOrderFormInput } from '../schemas/purchaseOrder.schema';

interface PurchaseOrderApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const formatCurrency = (value: number | string | null | undefined) => {
  const numberValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = numberValue !== null && numberValue !== undefined && Number.isFinite(numberValue) ? numberValue : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const today = new Date().toISOString().split('T')[0];

export function CreatePurchaseOrderPage() {
  "use no memo";

  const navigate = useNavigate();
  const createMutation = useCreatePurchaseOrder();

  const [formError, setFormError] = useState<string | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPricelistModalOpen, setIsPricelistModalOpen] = useState(false);
  const vendorFilters = useReferenceTableFilters(10);
  const productFilters = useReferenceTableFilters(10);
  const pricelistFilters = useReferenceTableFilters(10);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const scrollRef = useHorizontalScroll();

  const { data: vendorsData, isLoading: isVendorsLoading, isFetching: isVendorsFetching } = useVendors({
    page: vendorFilters.page,
    perPage: vendorFilters.perPage,
    filters: vendorFilters.queryFilters,
  });
  const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching } = useProducts({
    page: productFilters.page,
    perPage: productFilters.perPage,
    filters: productFilters.queryFilters,
  });
  const { data: pricelistsData, isLoading: isPricelistsLoading, isFetching: isPricelistsFetching } = usePricelists({
    page: pricelistFilters.page,
    perPage: pricelistFilters.perPage,
    filters: pricelistFilters.queryFilters,
  });

  const vendors = vendorsData?.items ?? [];
  const vendorsMeta = vendorsData?.meta;
  const products = productsData?.items ?? [];
  const productsMeta = productsData?.meta;
  const pricelists = pricelistsData?.items ?? [];
  const pricelistsMeta = pricelistsData?.meta;

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

  const visibleProducts = useMemo(() => {
    const q = productFilters.q.trim().toLowerCase();
    if (!q) return products;

    return products.filter((product) => String(product.product_name ?? '').toLowerCase().includes(q));
  }, [products, productFilters.q]);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePurchaseOrderFormInput>({
    resolver: zodResolver(createPurchaseOrderFormSchema),
    defaultValues: {
      head: {
        po_number: '',
        vendor_id: '',
        status: 'draft',
        po_date: today,
      },
      items: [{ pricelist_id: '', product_id: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const vendorId = useWatch({ control, name: 'head.vendor_id', defaultValue: '' });
  const watchedItems = useWatch({ control, name: 'items' });

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedProductsById, setSelectedProductsById] = useState<Record<string, Product>>({});
  const [selectedPricelistsById, setSelectedPricelistsById] = useState<Record<string, Pricelist>>({});

  const selectedVendorLabel = useMemo(() => {
    if (selectedVendor) return selectedVendor.vendor_name;
    const fromPage = vendors.find((item) => String(item.id) === String(vendorId));
    return fromPage?.vendor_name ?? '';
  }, [selectedVendor, vendors, vendorId]);

  const totalPrice = useMemo(() => {
    if (!Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce((total, item) => {
      const qty = Number(item?.quantity ?? 0);
      const price = Number(item?.unit_price ?? 0);
      const taxRate = Number(item?.tax_rate ?? 0);
      
      const safeQty = Number.isFinite(qty) ? qty : 0;
      const safePrice = Number.isFinite(price) ? price : 0;
      const safeTaxRate = Number.isFinite(taxRate) ? taxRate : 0;
      
      const subtotal = safeQty * safePrice;
      const taxAmount = (subtotal * safeTaxRate) / 100;
      return total + subtotal + taxAmount;
    }, 0);
  }, [watchedItems]);

  const canGoVendorPrev = Boolean(vendorsMeta?.hasPrevPage) && !isVendorsFetching;
  const canGoVendorNext = Boolean(vendorsMeta?.hasNextPage) && !isVendorsFetching;
  const canGoProductPrev = Boolean(productsMeta?.hasPrevPage) && !isProductsFetching;
  const canGoProductNext = Boolean(productsMeta?.hasNextPage) && !isProductsFetching;
  const canGoPricelistPrev = Boolean(pricelistsMeta?.hasPrevPage) && !isPricelistsFetching;
  const canGoPricelistNext = Boolean(pricelistsMeta?.hasNextPage) && !isPricelistsFetching;

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setValue('head.vendor_id', String(vendor.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('head.vendor_id');
    setSelectedProductsById({});
    setSelectedPricelistsById({});
    fields.forEach((_, index) => {
      setValue(`items.${index}.pricelist_id`, '', { shouldValidate: true, shouldDirty: true });
      setValue(`items.${index}.product_id`, '', { shouldValidate: true, shouldDirty: true });
      setValue(`items.${index}.unit_price`, 0, { shouldValidate: true, shouldDirty: true });
    });
    setIsVendorModalOpen(false);
  };

  const handleOpenProductModal = (index: number) => {
    setActiveItemIndex(index);
    setIsProductModalOpen(true);
  };

  const handleOpenPricelistModal = (index: number) => {
    if (!vendorId) {
      toast.error('Pilih vendor terlebih dahulu');
      return;
    }
    setActiveItemIndex(index);
    setIsPricelistModalOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    if (activeItemIndex === null) return;
    setSelectedProductsById((prev) => ({ ...prev, [String(product.id)]: product }));
    setValue(`items.${activeItemIndex}.product_id`, String(product.id), { shouldValidate: true, shouldDirty: true });
    setValue(`items.${activeItemIndex}.pricelist_id`, '', { shouldValidate: true, shouldDirty: true });
    clearErrors(`items.${activeItemIndex}.product_id`);
    setIsProductModalOpen(false);
  };

  const handleSelectPricelist = (pricelist: Pricelist) => {
    if (activeItemIndex === null) return;

    setSelectedPricelistsById((prev) => ({ ...prev, [String(pricelist.id)]: pricelist }));

    const pricelistProduct = pricelist.product;
    if (pricelistProduct) {
      setSelectedProductsById((prev) => ({ ...prev, [String(pricelistProduct.id)]: pricelistProduct as Product }));
    }

    setValue(`items.${activeItemIndex}.pricelist_id`, String(pricelist.id), { shouldValidate: true, shouldDirty: true });
    setValue(`items.${activeItemIndex}.product_id`, String(pricelist.product_id), { shouldValidate: true, shouldDirty: true });

    const nextUnitPrice = Number(pricelist.price);
    setValue(`items.${activeItemIndex}.unit_price`, Number.isFinite(nextUnitPrice) ? nextUnitPrice : 0, {
      shouldValidate: true,
      shouldDirty: true,
    });

    clearErrors(`items.${activeItemIndex}.product_id`);
    setIsPricelistModalOpen(false);
  };

  const resolveProductLabel = (productIdValue: unknown) => {
    const key = String(productIdValue ?? '');
    if (!key) return '';
    if (selectedProductsById[key]) return selectedProductsById[key].product_name;
    const fromPage = products.find((item) => String(item.id) === key);
    return fromPage?.product_name ?? '';
  };

  const resolvePricelistLabel = (pricelistIdValue: unknown) => {
    const key = String(pricelistIdValue ?? '');
    if (!key) return '';

    const selected = selectedPricelistsById[key];
    if (selected) {
      const currency = selected.currency?.trim() ? selected.currency.trim() : 'IDR';
      return `${currency} ${selected.price}`;
    }

    const fromPage = pricelists.find((item) => String(item.id) === key);
    if (!fromPage) return '';
    const currency = fromPage.currency?.trim() ? fromPage.currency.trim() : 'IDR';
    return `${currency} ${fromPage.price}`;
  };

  const filteredPricelists = useMemo(() => {
    const vendorKey = String(vendorId ?? '');
    if (!vendorKey) return [];
    const base = pricelists.filter((item) => String(item.vendor_id) === vendorKey);

    const q = pricelistFilters.q.trim().toLowerCase();
    if (!q) return base;

    return base.filter((item) => {
      const haystack = [
        item.vendor?.vendor_name ?? '',
        item.product?.product_name ?? '',
        item.currency ?? '',
        String(item.price ?? ''),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [pricelists, pricelistFilters.q, vendorId]);

  const onSubmit = async (values: CreatePurchaseOrderFormInput) => {
    setFormError(null);
    try {
      await createMutation.mutateAsync(values);
      toast.success('Purchase Order berhasil dibuat');
      navigate('/purchase');
    } catch (error) {
      if (axios.isAxiosError<PurchaseOrderApiErrorResponse>(error)) {
        const apiMessage = error.response?.data?.message;
        if (apiMessage) {
          setFormError(apiMessage);
          toast.error(apiMessage);
          return;
        }
      }

      setFormError('Gagal membuat Purchase Order. Silakan coba lagi.');
      toast.error('Gagal membuat Purchase Order. Silakan coba lagi.');
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
              <BreadcrumbPage>Create Purchase Order</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Create Purchase Order</CardTitle>
          <CardDescription>Buat Purchase Order dengan head, item, dan total.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Head</p>
                <p className="text-sm text-text">Informasi utama Purchase Order</p>
              </div>
            </div>

            <input type="hidden" {...register('head.vendor_id')} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="po-number">Nomor PO</Label>
                <Input id="po-number" {...register('head.po_number')} placeholder="PO-2026-0001" autoFocus />
                {errors.head?.po_number?.message && <p className="text-sm text-red-600">{errors.head.po_number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="po-date">Tanggal PO</Label>
                <Input id="po-date" type="date" {...register('head.po_date')} />
                {errors.head?.po_date?.message && <p className="text-sm text-red-600">{errors.head.po_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Vendor</Label>
                <div className="flex gap-2">
                  <Input value={selectedVendorLabel} placeholder="Pilih vendor" readOnly />
                  <Button type="button" variant="secondary" onClick={() => setIsVendorModalOpen(true)}>
                    Pilih
                  </Button>
                </div>
                {errors.head?.vendor_id?.message && <p className="text-sm text-red-600">{errors.head.vendor_id.message}</p>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Purchase Order Items</p>
                <p className="text-sm text-text">Daftar item yang dipesan</p>
              </div>

              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => append({ pricelist_id: '', product_id: '', quantity: 1, unit_price: 0 })}
              >
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>

            <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
              <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surface-2">
                  <tr>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">No</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Pricelist</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Produk</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Qty</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Harga Satuan</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Tax Rate (%)</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Tax Amount</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Total Price</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const qty = Number(watchedItems?.[index]?.quantity ?? 0);
                    const unitPrice = Number(watchedItems?.[index]?.unit_price ?? 0);
                    const taxRate = Number(watchedItems?.[index]?.tax_rate ?? 0);
                    
                    const safeQty = Number.isFinite(qty) ? qty : 0;
                    const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
                    const safeTaxRate = Number.isFinite(taxRate) ? taxRate : 0;

                    const subtotal = safeQty * safeUnitPrice;
                    const taxAmount = (subtotal * safeTaxRate) / 100;
                    const lineTotal = subtotal + taxAmount;

                    return (
                      <tr key={field.id} className="border-t border-border/80">
                        <td className="px-4 py-3 text-text">{index + 1}</td>
                        <td className="px-4 py-3">
                          <input type="hidden" {...register(`items.${index}.pricelist_id`)} />
                          <div className="flex gap-2">
                            <Input
                              value={resolvePricelistLabel(watchedItems?.[index]?.pricelist_id)}
                              placeholder={vendorId ? 'Pilih pricelist' : 'Pilih vendor dulu'}
                              readOnly
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleOpenPricelistModal(index)}
                              disabled={!vendorId}
                            >
                              Pilih
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="hidden" {...register(`items.${index}.product_id`)} />
                          <div className="flex gap-2">
                            <Input value={resolveProductLabel(watchedItems?.[index]?.product_id)} placeholder="Pilih produk" readOnly />
                            <Button type="button" variant="secondary" onClick={() => handleOpenProductModal(index)}>
                              Pilih
                            </Button>
                          </div>
                          {errors.items?.[index]?.product_id?.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.items[index]?.product_id?.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          />
                          {errors.items?.[index]?.quantity?.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                          />
                          {errors.items?.[index]?.unit_price?.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.items[index]?.unit_price?.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            {...register(`items.${index}.tax_rate`, { valueAsNumber: true })}
                          />
                          {errors.items?.[index]?.tax_rate?.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.items[index]?.tax_rate?.message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right metric-number font-semibold text-text-h">
                          {formatCurrency(taxAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-text-h">{formatCurrency(lineTotal)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            aria-label={`Hapus item ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {typeof errors.items?.message === 'string' && (
              <p className="mt-2 text-sm text-red-600">{errors.items.message}</p>
            )}
          </section>

          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Total</p>
                <p className="text-sm text-text">Total harga Purchase Order</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text">Total Price</p>
                <p className="metric-number text-2xl font-semibold text-text-h">{formatCurrency(totalPrice)}</p>
              </div>
            </div>
          </section>

          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/purchase')}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>

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
                  vendorFilters.setPage(Math.min(vendorsMeta?.lastPage ?? vendorFilters.page + 1, vendorFilters.page + 1))
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

      <Dialog
        open={isProductModalOpen}
        onOpenChange={(open) => {
          setIsProductModalOpen(open);
          if (open) productFilters.setPage(1);
          if (!open) setActiveItemIndex(null);
        }}
      >
        <DialogContent className="max-w-none">
          <DialogHeader>
            <DialogTitle>Pilih Produk</DialogTitle>
            <DialogDescription>Pilih produk dari tabel referensi.</DialogDescription>
          </DialogHeader>

          <MasterdataSearchBar
            value={productFilters.q}
            onChange={productFilters.updateSearch}
            onReset={productFilters.resetFilters}
            isLoading={isProductsLoading || isProductsFetching}
            placeholder="Cari nama produk"
            variant="compact"
          />

          <div className="max-h-[55vh] overflow-auto rounded-xl border border-border/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isProductsLoading ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={3}>
                      Loading products...
                    </td>
                  </tr>
                ) : visibleProducts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={3}>
                      Tidak ada data produk.
                    </td>
                  </tr>
                ) : (
                  visibleProducts.map((product) => (
                    <tr key={product.id} className="border-t border-border/70">
                      <td className="px-4 py-3">{product.product_name}</td>
                      <td className="px-4 py-3">{product.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" onClick={() => handleSelectProduct(product)}>
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
                onClick={() => productFilters.setPage(productFilters.page - 1)}
                disabled={!canGoProductPrev}
              >
                Sebelumnya
              </Button>
              <span className="text-xs text-text">
                Halaman {productsMeta?.currentPage ?? productFilters.page} / {productsMeta?.lastPage ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  productFilters.setPage(
                    Math.min(productsMeta?.lastPage ?? productFilters.page + 1, productFilters.page + 1)
                  )
                }
                disabled={!canGoProductNext}
              >
                Selanjutnya
              </Button>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPricelistModalOpen}
        onOpenChange={(open) => {
          setIsPricelistModalOpen(open);
          if (open) pricelistFilters.setPage(1);
          if (!open) setActiveItemIndex(null);
        }}
      >
        <DialogContent className="max-w-none">
          <DialogHeader>
            <DialogTitle>Pilih Pricelist</DialogTitle>
            <DialogDescription>Pilih pricelist sesuai vendor dan produk.</DialogDescription>
          </DialogHeader>

          <MasterdataSearchBar
            value={pricelistFilters.q}
            onChange={pricelistFilters.updateSearch}
            onReset={pricelistFilters.resetFilters}
            isLoading={isPricelistsLoading || isPricelistsFetching}
            placeholder="Cari pricelist, vendor, produk, atau mata uang"
            variant="compact"
          />

          <div className="max-h-[55vh] overflow-auto rounded-xl border border-border/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Mata Uang</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {!vendorId ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={6}>
                      Pilih vendor terlebih dahulu.
                    </td>
                  </tr>
                ) : isPricelistsLoading ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={6}>
                      Loading pricelists...
                    </td>
                  </tr>
                ) : filteredPricelists.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={6}>
                      Tidak ada pricelist untuk vendor ini.
                    </td>
                  </tr>
                ) : (
                  filteredPricelists.map((pricelist) => (
                    <tr key={pricelist.id} className="border-t border-border/70">
                      <td className="px-4 py-3">{pricelist.vendor?.vendor_name ?? '-'}</td>
                      <td className="px-4 py-3">{pricelist.product?.product_name ?? '-'}</td>
                      <td className="px-4 py-3">{pricelist.price}</td>
                      <td className="px-4 py-3">{pricelist.currency}</td>
                      <td className="px-4 py-3">{pricelist.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" onClick={() => handleSelectPricelist(pricelist)}>
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
                onClick={() => pricelistFilters.setPage(pricelistFilters.page - 1)}
                disabled={!canGoPricelistPrev}
              >
                Sebelumnya
              </Button>
              <span className="text-xs text-text">
                Halaman {pricelistsMeta?.currentPage ?? pricelistFilters.page} / {pricelistsMeta?.lastPage ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  pricelistFilters.setPage(
                    Math.min(pricelistsMeta?.lastPage ?? pricelistFilters.page + 1, pricelistFilters.page + 1)
                  )
                }
                disabled={!canGoPricelistNext}
              >
                Selanjutnya
              </Button>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsPricelistModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
