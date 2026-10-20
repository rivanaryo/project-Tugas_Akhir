"use no memo";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type Resolver, type SubmitHandler } from 'react-hook-form';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select } from '../../../../../components/ui/select';
import { MasterdataSearchBar } from '../../../../masterdata/components/MasterdataSearchBar';
import { useReferenceTableFilters } from '../../../../masterdata/hooks/useReferenceTableFilters';
import { usePurchaseOrders } from '../../../purchase-orders/hooks/usePurchaseOrders';
import { usePurchaseOrderItems } from '../../../purchase-orders/hooks/usePurchaseOrderItems';
import { useWarehouses } from '../../../../masterdata/warehouses/hooks/useWarehouses';
import { useCreateGoodReceipt } from '../../hooks/useCreateGoodReceipt';
import { createGoodReceiptFormSchema, type CreateGoodReceiptFormInput } from '../../schemas/goodReceipt.schema';
import type { PurchaseOrderHead, PurchaseOrderItemDetail } from '../../../purchase-orders/types/purchaseOrder.types';
import { GoodReceiptItemsTable } from './GoodReceiptItemsTable';

const today = new Date().toISOString().split('T')[0];

interface GoodReceiptCreateFormProps {
  redirectTo?: string;
}

export function GoodReceiptCreateForm({ redirectTo = '/inventory/good-receipts' }: GoodReceiptCreateFormProps) {
  const navigate = useNavigate();
  const createMutation = useCreateGoodReceipt();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);

  const purchaseOrderFilters = useReferenceTableFilters(10);
  const { data: purchaseOrdersData, isLoading: isPurchaseOrdersLoading, isFetching: isPurchaseOrdersFetching } = usePurchaseOrders({
    page: purchaseOrderFilters.page,
    perPage: purchaseOrderFilters.perPage,
    filters: { ...purchaseOrderFilters.queryFilters, status: 'approved' },
  });

  const { data: warehousesData, isLoading: isWarehousesLoading } = useWarehouses({ page: 1, perPage: 100 });
  const warehouses = warehousesData?.items ?? [];

  const purchaseOrders = useMemo(() => purchaseOrdersData?.items ?? [], [purchaseOrdersData?.items]);
  const purchaseOrdersMeta = purchaseOrdersData?.meta;

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoodReceiptFormInput>({
    resolver: zodResolver(createGoodReceiptFormSchema) as Resolver<CreateGoodReceiptFormInput>,
    defaultValues: {
      head: {
        gr_number: '',
        purchase_order_id: '',
        vendor_id: '',
        warehouse_id: '',
        status: 'draft',
        receipt_date: today,
      },
      items: [],
    },
  });

  const { fields, replace, remove, append } = useFieldArray<CreateGoodReceiptFormInput, 'items'>({ control, name: 'items' });

  const selectedPurchaseOrderId = useWatch({ control, name: 'head.purchase_order_id', defaultValue: '' });
  const selectedPurchaseOrder = useMemo<PurchaseOrderHead | null>(() => {
    if (!selectedPurchaseOrderId) return null;
    return purchaseOrders.find((item) => String(item.id) === String(selectedPurchaseOrderId)) ?? null;
  }, [purchaseOrders, selectedPurchaseOrderId]);

  const purchaseOrderItemsQuery = usePurchaseOrderItems({
    purchaseOrderId: selectedPurchaseOrder?.id,
    page: 1,
    perPage: 100,
  });

  const purchaseOrderItems = useMemo(() => purchaseOrderItemsQuery.data?.items ?? [], [purchaseOrderItemsQuery.data?.items]);

  const lastPurchaseOrderId = useRef<string>('');

  useEffect(() => {
    if (selectedPurchaseOrder) {
      setValue('head.vendor_id', String(selectedPurchaseOrder.vendor_id), { shouldValidate: true, shouldDirty: true });
      clearErrors('head.vendor_id');
    } else {
      setValue('head.vendor_id', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedPurchaseOrder, setValue, clearErrors]);

  useEffect(() => {
    if (selectedPurchaseOrderId === '') {
      replace([]);
      lastPurchaseOrderId.current = '';
      return;
    }

    if (lastPurchaseOrderId.current !== selectedPurchaseOrderId) {
      replace([]);
      lastPurchaseOrderId.current = selectedPurchaseOrderId;
    }
  }, [selectedPurchaseOrderId, replace]);

  const visiblePurchaseOrders = useMemo(() => {
    const query = purchaseOrderFilters.q.trim().toLowerCase();
    if (!query) return purchaseOrders;

    return purchaseOrders.filter((order) => {
      const haystack = [order.po_number, order.vendor?.vendor_name ?? ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [purchaseOrders, purchaseOrderFilters.q]);

  const handleChoosePurchaseOrder = (purchaseOrder: PurchaseOrderHead) => {
    setValue('head.purchase_order_id', String(purchaseOrder.id), { shouldValidate: true, shouldDirty: true });
    setValue('head.vendor_id', String(purchaseOrder.vendor_id), { shouldValidate: true, shouldDirty: true });
    clearErrors(['head.purchase_order_id', 'head.vendor_id']);
    setIsPurchaseOrderModalOpen(false);
  };

  const handleCopyPurchaseOrderItems = () => {
    if (!selectedPurchaseOrder) {
      toast.error('Pilih Purchase Order terlebih dahulu.');
      return;
    }

    if (!purchaseOrderItems.length) {
      toast.error('Purchase Order belum memiliki item.');
      return;
    }

    replace(
      purchaseOrderItems.map((item: PurchaseOrderItemDetail) => ({
        purchase_order_item_id: String(item.id ?? ''),
        qty_received: item.quantity ?? 1,
        product_name: item.product?.product_name ?? '-',
        qty_ordered: item.quantity ?? 0,
      }))
    );

    toast.success('Item Purchase Order berhasil disalin. Silakan atur qty diterima.');
  };

  const handleSubmitForm: SubmitHandler<CreateGoodReceiptFormInput> = async (payload) => {
    setFormError(null);

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Good Receipt berhasil dibuat.');
      navigate(redirectTo);
    } catch (error) {
      console.error(error);
      setFormError('Gagal membuat Good Receipt. Silakan coba lagi.');
      toast.error('Gagal membuat Good Receipt.');
    }
  };

  const vendorName = selectedPurchaseOrder?.vendor?.vendor_name ?? '';
  const purchaseOrderLabel = selectedPurchaseOrder?.po_number ?? 'Belum dipilih';
  const canCopyItems = Boolean(selectedPurchaseOrder && purchaseOrderItems.length > 0);
  const canGoPrev = Boolean(purchaseOrdersMeta?.hasPrevPage) && !isPurchaseOrdersFetching;
  const canGoNext = Boolean(purchaseOrdersMeta?.hasNextPage) && !isPurchaseOrdersFetching;

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      <input type="hidden" {...register('head.purchase_order_id')} />
      <input type="hidden" {...register('head.vendor_id')} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-2/40 p-6">
          <div>
            <Label htmlFor="gr_number">Nomor GR</Label>
            <Input id="gr_number" placeholder="GR001/SD15-ARQ/V/26" {...register('head.gr_number')} />
            {errors.head?.gr_number?.message ? <p className="mt-1 text-sm text-destructive">{errors.head.gr_number.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="purchase_order">Purchase Order</Label>
            <div className="flex gap-2">
              <Input id="purchase_order" value={purchaseOrderLabel} readOnly />
              <Button type="button" onClick={() => setIsPurchaseOrderModalOpen(true)}>
                Pilih PO
              </Button>
            </div>
            {errors.head?.purchase_order_id?.message ? (
              <p className="mt-1 text-sm text-destructive">{errors.head.purchase_order_id.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" value={vendorName} readOnly placeholder="Vendor akan terisi setelah pilih PO" />
            {errors.head?.vendor_id?.message ? <p className="mt-1 text-sm text-destructive">{errors.head.vendor_id.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="warehouse">Warehouse</Label>
            <Select id="warehouse" {...register('head.warehouse_id')} disabled={isWarehousesLoading}>
              <option value="">{isWarehousesLoading ? 'Memuat warehouse...' : 'Pilih warehouse'}</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={String(warehouse.id)}>
                  {warehouse.code ? `${warehouse.code} - ` : ''}{warehouse.name}
                </option>
              ))}
            </Select>
            {errors.head?.warehouse_id?.message ? <p className="mt-1 text-sm text-destructive">{errors.head.warehouse_id.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="receipt_date">Tanggal Receipt</Label>
              <Input id="receipt_date" type="date" {...register('head.receipt_date')} />
              {errors.head?.receipt_date?.message ? (
                <p className="mt-1 text-sm text-destructive">{errors.head.receipt_date.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register('head.status')}>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              {errors.head?.status?.message ? <p className="mt-1 text-sm text-destructive">{errors.head.status.message}</p> : null}
            </div>
          </div>

          <Button type="button" onClick={handleCopyPurchaseOrderItems} disabled={!canCopyItems || purchaseOrderItemsQuery.isLoading}>
            Salin Purchase Order
          </Button>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
              <CardDescription>Pastikan PO yang dipilih sudah benar sebelum menyimpan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm text-text">
                <div className="flex items-center justify-between">
                  <span>PO dipilih</span>
                  <strong>{purchaseOrderLabel}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vendor</span>
                  <strong>{vendorName || '-'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Item PO</span>
                  <strong>{purchaseOrderItems.length}</strong>
                </div>
              </div>

              <hr className="my-4 border-border/70" />

              <div className="space-y-3 text-sm text-text">
                <p>Gunakan tombol <span className="font-semibold">Salin Purchase Order</span> untuk memindahkan item PO ke tabel Good Receipt Items.</p>
                <p>Isi qty terima untuk setiap item secara manual sebelum simpan.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <GoodReceiptItemsTable
        fields={fields}
        register={register}
        errors={errors}
        remove={remove}
        append={append}
        purchaseOrderItems={purchaseOrderItems}
        isLoadingItems={purchaseOrderItemsQuery.isLoading}
        hasPurchaseOrder={Boolean(selectedPurchaseOrder)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => navigate('/inventory/good-receipts')}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {isSubmitting || createMutation.isPending ? 'Menyimpan...' : 'Simpan Good Receipt'}
        </Button>
      </div>

      <Dialog open={isPurchaseOrderModalOpen} onOpenChange={(open) => setIsPurchaseOrderModalOpen(open)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Pilih Purchase Order</DialogTitle>
            <DialogDescription>Pilih PO untuk mengisi head dan salin item secara otomatis.</DialogDescription>
          </DialogHeader>

          <MasterdataSearchBar
            value={purchaseOrderFilters.q}
            onChange={purchaseOrderFilters.updateSearch}
            onReset={purchaseOrderFilters.resetFilters}
            placeholder="Cari PO nomor atau nama vendor"
            isLoading={isPurchaseOrdersLoading || isPurchaseOrdersFetching}
            variant="compact"
          />

          <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-border/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isPurchaseOrdersLoading ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={5}>
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : visiblePurchaseOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={5}>
                      Tidak ada purchase order.
                    </td>
                  </tr>
                ) : (
                  visiblePurchaseOrders.map((purchaseOrder) => (
                    <tr key={purchaseOrder.id} className="border-t border-border/70">
                      <td className="px-4 py-3">{purchaseOrder.po_number}</td>
                      <td className="px-4 py-3">{purchaseOrder.vendor?.vendor_name ?? '-'}</td>
                      <td className="px-4 py-3">{purchaseOrder.status}</td>
                      <td className="px-4 py-3">{purchaseOrder.po_date}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" onClick={() => handleChoosePurchaseOrder(purchaseOrder)}>
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
              <Button type="button" variant="secondary" size="sm" onClick={() => purchaseOrderFilters.setPage(purchaseOrderFilters.page - 1)} disabled={!canGoPrev}>
                Sebelumnya
              </Button>
              <span className="text-xs text-text">
                Halaman {purchaseOrdersMeta?.currentPage ?? purchaseOrderFilters.page} / {purchaseOrdersMeta?.lastPage ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => purchaseOrderFilters.setPage(Math.min(purchaseOrdersMeta?.lastPage ?? purchaseOrderFilters.page + 1, purchaseOrderFilters.page + 1))}
                disabled={!canGoNext}
              >
                Selanjutnya
              </Button>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsPurchaseOrderModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
