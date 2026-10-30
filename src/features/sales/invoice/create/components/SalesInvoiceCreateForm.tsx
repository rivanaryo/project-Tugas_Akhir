"use no memo";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { SearchBar } from '../../../../../components/ui/searchbar';
import { useReferenceTableFilters } from '../../../../masterdata/hooks/useReferenceTableFilters';
import { useSalesOrders } from '../../../sales-order/hooks/useSalesOrders';
import { salesOrderService } from '../../../sales-order/services/salesOrder.service';
import { useCreateSalesInvoice } from '../../hooks/useCreateSalesInvoices';
import { salesInvoiceCreateFormSchema, type SalesInvoiceCreateFormInput } from '../../schemas/salesInvoice.schemas';
import { SalesInvoiceCreateItemsTable } from './SalesInvoiceItemsTable';
import type { SalesOrderHead, SalesOrderItemDetail } from '../../../sales-order/types/salesOrder.types';
import axios from 'axios';
import { Select } from '../../../../../components/ui/select';

const today = new Date().toISOString().split('T')[0];

export function SalesInvoiceCreateForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSalesOrder = searchParams.get('from_so');
  const initialSalesOrder = useQuery({ queryKey: ['sales-order', fromSalesOrder], queryFn: () => salesOrderService.fetchSalesOrder(fromSalesOrder!), enabled: !!fromSalesOrder });
  const [chosenSalesOrder, setSelectedSalesOrder] = useState<SalesOrderHead | null>(null);
  const selectedSalesOrder = chosenSalesOrder ?? initialSalesOrder.data ?? null;
  const selectedSalesOrderId = selectedSalesOrder ? String(selectedSalesOrder.id) : '';
  const createMutation = useCreateSalesInvoice();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);

  const soFilters = useReferenceTableFilters(10);
  const { data: salesOrdersData, isLoading: isSalesOrdersLoading, isFetching: isSalesOrdersFetching } = useSalesOrders({
    page: soFilters.page,
    perPage: soFilters.perPage,
    filters: soFilters.queryFilters,
  });

  const salesOrders = useMemo(() => salesOrdersData?.items ?? [], [salesOrdersData?.items]);
  const salesOrdersMeta = salesOrdersData?.meta;

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SalesInvoiceCreateFormInput>({
    resolver: zodResolver(salesInvoiceCreateFormSchema) as Resolver<SalesInvoiceCreateFormInput>,
    defaultValues: {
      head: {
        customer_id: '',
        sales_order_id: '',
        invoice_number: '',
        invoice_date: today,
        due_date: '',
        type: searchParams.get('type') === 'pelunasan' ? 'pelunasan' : 'dp',
        status: 'pending',
      },
      items: [],
    },
  });

  const invoiceDate = useWatch({ control, name: 'head.invoice_date' });
  const { fields, replace, remove } = useFieldArray<SalesInvoiceCreateFormInput, 'items'>({ control, name: 'items' });

  const lastSalesOrderId = useRef<string>('');

  useEffect(() => {
    if (selectedSalesOrder) {
      setValue('head.customer_id', String(selectedSalesOrder.customer_id), { shouldValidate: true, shouldDirty: true });
      setValue('head.sales_order_id', String(selectedSalesOrder.id), { shouldValidate: true, shouldDirty: true });
      clearErrors('head.customer_id');
    }
  }, [selectedSalesOrder, setValue, clearErrors]);

  useEffect(() => {
    if (selectedSalesOrderId === '') {
      replace([]);
      lastSalesOrderId.current = '';
      return;
    }

    if (lastSalesOrderId.current !== selectedSalesOrderId) {
      replace([]);
      lastSalesOrderId.current = selectedSalesOrderId;
    }
  }, [selectedSalesOrderId, replace]);

  const visibleSalesOrders = useMemo(() => {
    const query = soFilters.q.trim().toLowerCase();
    if (!query) return salesOrders;

    return salesOrders.filter((order) => {
      const haystack = [order.order_number, order.customer?.customer_name ?? ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [salesOrders, soFilters.q]);

  const handleChooseSalesOrder = (so: SalesOrderHead) => {
    setSelectedSalesOrder(so);
    setValue('head.customer_id', String(so.customer_id), { shouldValidate: true, shouldDirty: true });
    setValue('head.sales_order_id', String(so.id), { shouldValidate: true, shouldDirty: true });
    clearErrors(['head.customer_id']);
    setIsSalesOrderModalOpen(false);
  };

  const handleCopySalesOrderItems = async () => {
    if (!selectedSalesOrderId) {
      toast.error('Pilih Sales Order terlebih dahulu.');
      return;
    }

    try {
      setValue('head.sales_order_id', selectedSalesOrderId, { shouldValidate: true, shouldDirty: true });
      const itemsResponse = await salesOrderService.fetchSalesOrderItems(selectedSalesOrderId, 1, 100);
      
      if (!itemsResponse.items.length) {
        toast.error('Sales Order belum memiliki item.');
        return;
      }

      const newItems = itemsResponse.items.map((item: SalesOrderItemDetail) => ({
        sales_order_item_id: String(item.id ?? ''),
        qty_invoice: Number(item.quantity ?? 0),
        product_name: `${item.product?.product_name ?? '-'}${item.size ? ` (${item.size})` : ''}`,
        qty_so: item.quantity ?? 0,
        unit_price: Number(item.unit_price ?? 0),
        subtotal: Number(item.quantity ?? 0) * Number(item.unit_price ?? 0),
        tax_rate: Number(item.tax_rate ?? 0),
        tax_amount: item.tax_amount ?? 0,
        total_price: item.total_price ?? Number(item.quantity ?? 0) * Number(item.unit_price ?? 0) + Number(item.tax_amount ?? 0),
      }));

      replace(newItems);

      toast.success('Item Sales Order berhasil disalin. Silakan atur qty invoice.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      toast.error('Gagal menyalin item Sales Order.');
    }
  };

  const onSubmit: SubmitHandler<SalesInvoiceCreateFormInput> = async (payload) => {
    setFormError(null);

    try {
      const items = payload.items.map((item) => ({
        sales_order_item_id: String(item.sales_order_item_id),
        qty_invoice: Math.floor(Number(item.qty_invoice)),
        unit_price: Number(item.unit_price),
        tax_rate: Number(item.tax_rate ?? 0),
      }));

      await createMutation.mutateAsync({ head: { ...payload.head, due_date: payload.head.due_date || undefined }, items });
      toast.success('Sales Invoice berhasil dibuat.');
      navigate('/sales/sales-invoices');
    } catch (error: unknown) {
      let message = 'Gagal membuat Sales Invoice.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      setFormError(message);
      toast.error(message);
    }
  };

  const customerName = selectedSalesOrder?.customer?.customer_name ?? '';
  const salesOrderLabel = selectedSalesOrder?.order_number ?? 'Belum dipilih';
  const canCopyItems = Boolean(selectedSalesOrderId);
  const canGoPrev = Boolean(salesOrdersMeta?.hasPrevPage) && !isSalesOrdersFetching;
  const canGoNext = Boolean(salesOrdersMeta?.hasNextPage) && !isSalesOrdersFetching;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('head.sales_order_id')} />
      <input type="hidden" {...register('head.customer_id')} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-surface-2/40 p-6">
          <div>
            <Label htmlFor="invoice_number">Nomor Invoice</Label>
            <Input id="invoice_number" placeholder="INV/YYYY/MM/XXX" {...register('head.invoice_number')} />
            {errors.head?.invoice_number?.message ? <p className="mt-1 text-sm text-destructive">{errors.head.invoice_number.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="sales_order">Sales Order Reference</Label>
            <div className="flex gap-2">
              <Input id="sales_order" value={salesOrderLabel} readOnly className="bg-surface-1" />
              <Button type="button" onClick={() => setIsSalesOrderModalOpen(true)}>
                Pilih SO
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="customer">Customer</Label>
            <Input id="customer" value={customerName} readOnly placeholder="Customer akan terisi otomatis" className="bg-surface-1" />
            {errors.head?.customer_id?.message ? <p className="mt-1 text-sm text-destructive">{errors.head.customer_id.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="invoice_date">Tanggal Invoice</Label>
              <Input id="invoice_date" type="date" {...register('head.invoice_date')} />
              {errors.head?.invoice_date?.message ? (
                <p className="mt-1 text-sm text-destructive">{errors.head.invoice_date.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="due_date">Tanggal Jatuh Tempo (Opsional)</Label>
              <Input id="due_date" type="date" min={invoiceDate || undefined} aria-describedby="due-date-help" aria-invalid={Boolean(errors.head?.due_date)} {...register('head.due_date')} />
              <p id="due-date-help" className="mt-1 text-xs text-text">Kosongkan untuk otomatis 30 hari setelah tanggal invoice.</p>
              {errors.head?.due_date?.message && <p className="mt-1 text-sm text-destructive">{errors.head.due_date.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="invoice_type">Tipe Invoice</Label>
            <Select id="invoice_type" {...register('head.type')}><option value="dp">DP</option><option value="pelunasan">Pelunasan</option></Select>
            {errors.head?.type?.message && <p className="mt-1 text-sm text-destructive">{errors.head.type.message}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('head.status')}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          
          

          <Button type="button" variant="default" className="w-full gap-2 border-accent text-white hover:bg-accent/10 hover:text-accent" onClick={handleCopySalesOrderItems} disabled={!canCopyItems}>
            Salin dari Sales Order
          </Button>

          {formError ? <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{formError}</p> : null}
        </div>

        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
              <CardDescription>Pastikan referensi SO yang dipilih sudah benar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm text-text">
                <div className="flex items-center justify-between">
                  <span>SO Referensi</span>
                  <strong className="text-text-h">{salesOrderLabel}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Customer</span>
                  <strong className="text-text-h">{customerName || '-'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Jumlah Item</span>
                  <strong className="text-accent">{fields.length}</strong>
                </div>
              </div>

              <hr className="my-4 border-border/70" />

              <div className="space-y-3 text-sm text-text italic">
                <p>1. Klik <span className="font-semibold text-text-h">Pilih SO</span> untuk mencari Sales Order.</p>
                <p>2. Gunakan tombol <span className="font-semibold text-accent">Salin dari Sales Order</span> untuk memuat item.</p>
                <p>3. Sesuaikan <span className="font-semibold text-text-h">Qty Dikirim</span> sebelum menyimpan.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SalesInvoiceCreateItemsTable fields={fields} register={register} control={control} errors={errors} remove={remove} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-border pt-6">
        <Button type="button" variant="secondary" onClick={() => navigate('/sales/sales-invoices')}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
          {isSubmitting || createMutation.isPending ? 'Menyimpan...' : 'Simpan Sales Invoice'}
        </Button>
      </div>

      <Dialog open={isSalesOrderModalOpen} onOpenChange={(open) => setIsSalesOrderModalOpen(open)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Pilih Sales Order</DialogTitle>
            <DialogDescription>Pilih referensi SO untuk membuat Sales Invoice.</DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <SearchBar
              value={soFilters.q}
              onChange={soFilters.updateSearch}
              onReset={soFilters.resetFilters}
              placeholder="Cari nomor SO atau nama customer"
            />
          </div>

          <div className="mt-4 flex-1 overflow-auto rounded-xl border border-border/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-h">SO Number</th>
                  <th className="px-4 py-3 font-semibold text-text-h">Customer</th>
                  <th className="px-4 py-3 font-semibold text-text-h">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isSalesOrdersLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center" colSpan={4}>
                      Loading sales orders...
                    </td>
                  </tr>
                ) : visibleSalesOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-text italic" colSpan={4}>
                      Tidak ada sales order yang tersedia.
                    </td>
                  </tr>
                ) : (
                  visibleSalesOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-h">{so.order_number}</td>
                      <td className="px-4 py-3 text-text">{so.customer?.customer_name ?? '-'}</td>
                      <td className="px-4 py-3 text-text">{so.order_date.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleChooseSalesOrder(so)}>
                          Pilih
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter className="mt-4 border-t border-border pt-4">
            <div className="mr-auto flex items-center gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => soFilters.setPage(soFilters.page - 1)} 
                disabled={!canGoPrev}
              >
                Sebelumnya
              </Button>
              <span className="text-xs font-semibold text-text-h px-2">
                Halaman {salesOrdersMeta?.currentPage ?? soFilters.page} / {salesOrdersMeta?.lastPage ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => soFilters.setPage(soFilters.page + 1)}
                disabled={!canGoNext}
              >
                Selanjutnya
              </Button>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsSalesOrderModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
