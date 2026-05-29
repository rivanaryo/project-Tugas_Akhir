"use no memo";

import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import {  useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form'; 
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
import { useCustomers } from '../../../masterdata/customers/hooks/useCustomers';
import type { Customer } from '../../../masterdata/customers/types/customer.types';
import { useSalesDelivery } from '../hooks/useSalesDelivery';
import { useSalesDeliveryItems } from '../hooks/useSalesDeliveryItems';
import { useUpdateSalesDelivery } from '../hooks/useUpdateSalesDelivery';
import { createSalesDeliveryFormSchema, type CreateSalesDeliveryFormInput } from '../schemas/salesDelivery.schemas';
import { Select } from '../../../../components/ui/select';

interface SalesDeliveryApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const normalizeSalesDeliveryStatus = (status: unknown): '0' | '1' | '2' => {
  if (status === true || status === 1 || status === '1') return '1';
  if (status === 2 || status === '2') return '2';
  if (status === false || status === 0 || status === '0') return '0';

  const text = typeof status === 'string' ? status.trim().toLowerCase() : '';

  if (text === '1') return '1';
  if (text === '2') return '2';
  if (text === '0') return '0';
  if (text === 'true') return '1';
  if (text === 'false') return '0';
  if (text === 'completed') return '1';
  if (text === 'cancelled' || text === 'canceled') return '2';
  if (text === 'pending') return '0';

  return '0';
};

export function EditSalesDeliveryPage() {
  "use no memo";

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateMutation = useUpdateSalesDelivery();

  const { data: salesDelivery, isLoading: isHeadLoading } = useSalesDelivery(id);
  const { data: itemsData, isLoading: isItemsLoading } = useSalesDeliveryItems({
    salesDeliveryId: id,
    page: 1,
    perPage: 100,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const customerFilters = useReferenceTableFilters(10);
  const scrollRef = useHorizontalScroll();

  const { data: customersData, isLoading: isCustomersLoading, isFetching: isCustomersFetching } = useCustomers({
    page: customerFilters.page,
    perPage: customerFilters.perPage,
    filters: customerFilters.queryFilters,
  });

  const customers = customersData?.items ?? [];
  const customersMeta = customersData?.meta;

  const visibleCustomers = useMemo(() => {
    const q = customerFilters.q.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((customer) => {
      const haystack = [
        customer.customer_name,
        customer.contact_person ?? '',
        customer.phone_number ?? '',
        customer.email ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [customers, customerFilters.q]);



  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSalesDeliveryFormInput>({
    resolver: zodResolver(createSalesDeliveryFormSchema) as Resolver<CreateSalesDeliveryFormInput>,
    defaultValues: {
      head: {
        delivery_number: '',
        customer_id: '',
        sales_order_id: '',
        status: '0',
        delivery_date: '',
      },
      items: [],
    },
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (salesDelivery && itemsData) {
      const items = itemsData.items.map((item) => ({
        sales_order_item_id: String(item.sales_order_item_id),
        qty_delivered: Number(item.qty_delivered),
        tax_rate: Number(item.tax_rate ?? 0),
        product_name: item.product?.product_name ?? item.sales_order_item?.product?.product_name ?? '',
        qty_so: item.sales_order_item?.quantity ?? 0,
      }));

      reset({
        head: {
          delivery_number: salesDelivery.delivery_number,
          customer_id: String(salesDelivery.customer_id),
          sales_order_id: String(salesDelivery.sales_order_id),
          status: normalizeSalesDeliveryStatus(salesDelivery.status),
          delivery_date: salesDelivery.delivery_date.slice(0, 10),
        },
        items,
      });
    }
  }, [salesDelivery, itemsData, reset]);

  const { fields} = useFieldArray({
    control,
    name: 'items',
  });

  const customerId = useWatch({ control, name: 'head.customer_id', defaultValue: '' });
  const watchedItems = useWatch({ control, name: 'items' });

  const selectedCustomerLabel = useMemo(() => {
    if (!customerId) return '';

    // 1. Manually selected
    if (selectedCustomer && String(selectedCustomer.id) === String(customerId)) {
      return selectedCustomer.customer_name;
    }

    // 2. From initial data
    if (salesDelivery && String(salesDelivery.customer_id) === String(customerId)) {
      return salesDelivery.customer?.customer_name ?? '';
    }

    // 3. From current page
    const fromPage = customers.find((item) => String(item.id) === String(customerId));
    return fromPage?.customer_name ?? '';
  }, [customerId, customers, salesDelivery, selectedCustomer]);

  const canGoCustomerPrev = Boolean(customersMeta?.hasPrevPage) && !isCustomersFetching;
  const canGoCustomerNext = Boolean(customersMeta?.hasNextPage) && !isCustomersFetching;

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue('head.customer_id', String(customer.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('head.customer_id');
    setIsCustomerModalOpen(false);
  };




  const resolveProductLabel = (index: number) => {
    const item = watchedItems?.[index];
    return item?.product_name ?? '';
  };

  const onSubmit = async (data: CreateSalesDeliveryFormInput) => {
    if (!id) return;
    try {
      setFormError(null);
      const headPayload = {
        customer_id: data.head.customer_id,
        status: data.head.status,
        delivery_date: data.head.delivery_date,
        ...(salesDelivery && data.head.delivery_number !== salesDelivery.delivery_number
          ? { delivery_number: data.head.delivery_number }
          : {}),
      };

      await updateMutation.mutateAsync({ id, payload: { head: headPayload } });
      toast.success('Sales Delivery berhasil diperbarui');
      navigate('/sales/sales-deliveries');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as SalesDeliveryApiErrorResponse;
        const fieldMessage = data?.errors?.delivery_number?.[0];
        if (fieldMessage) {
          setError('head.delivery_number', { type: 'server', message: fieldMessage });
        }
        setFormError(data?.message ?? 'Gagal memperbarui Sales Delivery');
      } else {
        setFormError('Terjadi kesalahan yang tidak terduga');
      }
    }
  };

  if (isHeadLoading || isItemsLoading) {
    return <div className="p-8 text-center">Loading sales delivery data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/sales">Sales</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/sales/sales-deliveries">Sales Deliveries</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit {salesDelivery?.delivery_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Edit Sales Delivery</CardTitle>
          <CardDescription>Perbarui data Sales Delivery header.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Head</p>
                <p className="text-sm text-text">Informasi utama Sales Delivery</p>
              </div>
            </div>

            <input type="hidden" {...register('head.customer_id')} />
            <input type="hidden" {...register('head.sales_order_id')} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sd-number">Nomor Delivery</Label>
                <Input id="sd-number" {...register('head.delivery_number')} readOnly className="bg-surface-2" />
                {errors.head?.delivery_number?.message && <p className="text-sm text-red-600">{errors.head.delivery_number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sd-date">Tanggal Delivery</Label>
                <Input id="sd-date" type="date" {...register('head.delivery_date')} />
                {errors.head?.delivery_date?.message && <p className="text-sm text-red-600">{errors.head.delivery_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Customer</Label>
                <div className="flex gap-2">
                  <Input value={selectedCustomerLabel} placeholder="Pilih customer" readOnly />
                  <Button type="button" variant="secondary" onClick={() => setIsCustomerModalOpen(true)}>
                    Pilih
                  </Button>
                </div>
                {errors.head?.customer_id?.message && <p className="text-sm text-red-600">{errors.head.customer_id.message}</p>}
              </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register('head.status')}>
              <option value="0">Pending</option>
              <option value="1">Completed</option>
              <option value="2">Cancelled</option>
            </Select>
          </div>            
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Sales Delivery Items</p>
                <p className="text-sm text-text">Daftar item yang dikirim</p>
              </div>
            </div>

            <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
              <table className="min-w-[800px] w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surface-2">
                  <tr>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">No</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Produk</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Qty SO</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Qty Dikirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {fields.map((field, index) => {
                    const item = watchedItems?.[index];
                    return (
                      <tr key={field.id} className="hover:bg-surface-2/30">
                        <td className="px-4 py-3 text-text-h font-medium">{index + 1}</td>
                        <td className="px-4 py-3 font-semibold text-text-h">
                          {resolveProductLabel(index)}
                        </td>
                        <td className="px-4 py-3 text-right text-text font-medium">
                          {item?.qty_so ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Input
                            type="number"
                            min="1"
                            {...register(`items.${index}.qty_delivered` as const, { valueAsNumber: true })}
                            className="w-24 text-right font-bold text-accent"
                          />
                          {errors.items?.[index]?.qty_delivered?.message && (
                            <p className="mt-1 text-xs text-red-600">{errors.items[index].qty_delivered.message}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col items-end gap-2 p-4">
            <div className="grid w-full max-w-xs grid-cols-2 gap-2 text-sm">
              <span className="text-text">Total Qty Dikirim:</span>
              <span className="text-right font-semibold text-text-h">
                {watchedItems?.reduce((acc, item) => acc + Number(item?.qty_delivered ?? 0), 0) ?? 0}
              </span>
            </div>
          </section>

          {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{formError}</div>}

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={() => navigate('/sales/sales-deliveries')} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isCustomersLoading}>
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Sales Delivery'}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Modal Pilih Customer */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Pilih Customer</DialogTitle>
            <DialogDescription>Pilih customer untuk Sales Delivery ini.</DialogDescription>
            <div className="mt-4">
              <MasterdataSearchBar  
                onReset={() => customerFilters.updateSearch('')}
                value={customerFilters.q}
                onChange={(val) => customerFilters.updateSearch(val)} 
                placeholder="Cari customer..."
              />
            </div>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto p-6 pt-2">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  <th className="px-4 py-3">Nama Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isCustomersLoading ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={3}>
                      Loading customers...
                    </td>
                  </tr>
                ) : visibleCustomers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={3}>
                      Tidak ada data customer.
                    </td>
                  </tr>
                ) : (
                  visibleCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-border/50 hover:bg-surface-2/50">
                      <td className="px-4 py-3 font-medium text-text-h">{customer.customer_name}</td>
                      <td className="px-4 py-3 text-text">
                        {customer.contact_person}
                        {customer.phone_number && <div className="text-xs opacity-70">{customer.phone_number}</div>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleSelectCustomer(customer)}>
                          Pilih
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter className="border-t border-border bg-surface-2 p-4">
            <div className="flex w-full items-center justify-between">
              <p className="text-xs text-text">
                {customersMeta ? `Halaman ${customersMeta.currentPage} dari ${customersMeta.lastPage}` : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => customerFilters.setPage(customerFilters.page - 1)}
                  disabled={!canGoCustomerPrev}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => customerFilters.setPage(customerFilters.page + 1)}
                  disabled={!canGoCustomerNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
