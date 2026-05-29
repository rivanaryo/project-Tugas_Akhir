import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
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
import { useSalesInvoice } from '../hooks/useSalesInvoice';
import { useSalesInvoiceItems } from '../hooks/useSalesInvoiceItems';
import { useUpdateSalesInvoice } from '../hooks/useUpdateSalesInvoice';
import { SalesInvoiceItemsTable } from '../components/SalesInvoiceItemsTable';
import { Select } from '../../../../components/ui/select';

const updateSalesInvoiceStatusSchema = z.enum(['pending', 'approved', 'cancelled']);

const updateSalesInvoiceFormSchema = z.object({
  head: z.object({
    invoice_number: z.string().trim().optional(),
    invoice_date: z.string().trim().min(1, 'Tanggal Invoice wajib diisi'),
    customer_id: z.string().trim().min(1, 'Customer wajib dipilih'),
    sales_order_id: z.string().trim().optional(),
    status: updateSalesInvoiceStatusSchema,
  }),
});

type UpdateSalesInvoiceFormInput = z.infer<typeof updateSalesInvoiceFormSchema>;

interface SalesInvoiceApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function EditSalesInvoicePage() {
  "use no memo";

  const params = useParams<{ id?: string; invoiceId?: string }>();
  const id = params.invoiceId ?? params.id;
  const navigate = useNavigate();
  const updateMutation = useUpdateSalesInvoice();

  const { data: salesInvoice, isLoading: isHeadLoading } = useSalesInvoice(id);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError, isFetching: isItemsFetching } =
    useSalesInvoiceItems({
    invoiceId: id,
    page: 1,
    perPage: 100,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const customerFilters = useReferenceTableFilters(10);

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
  } = useForm<UpdateSalesInvoiceFormInput>({
    resolver: zodResolver(updateSalesInvoiceFormSchema),
    defaultValues: {
      head: {
        customer_id: '',
        sales_order_id: '',
        invoice_number: '',
        status: 'pending',
        invoice_date: '',
      },
    },
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (salesInvoice) {
      const normalizedStatus =
        typeof salesInvoice.status === 'boolean'
          ? salesInvoice.status
            ? 'approved'
            : 'pending'
          : salesInvoice.status === 'pending' || salesInvoice.status === 'approved' || salesInvoice.status === 'cancelled'
            ? salesInvoice.status
            : 'pending';

      reset({
        head: {
          invoice_number: salesInvoice.invoice_number,
          customer_id: String(salesInvoice.customer_id),
          sales_order_id: salesInvoice.sales_order_id ? String(salesInvoice.sales_order_id) : '',
          status: normalizedStatus,
          invoice_date: salesInvoice.invoice_date.slice(0, 10),
        },
      });
    }
  }, [salesInvoice, reset]);

  const customerId = useWatch({ control, name: 'head.customer_id', defaultValue: '' });

  const selectedCustomerLabel = useMemo(() => {
    if (!customerId) return '';

    // 1. Manually selected
    if (selectedCustomer && String(selectedCustomer.id) === String(customerId)) {
      return selectedCustomer.customer_name;
    }

    // 2. From initial data
    if (salesInvoice && String(salesInvoice.customer_id) === String(customerId)) {
      return salesInvoice.customer?.customer_name ?? '';
    }

    // 3. From current page
    const fromPage = customers.find((item) => String(item.id) === String(customerId));
    return fromPage?.customer_name ?? '';
  }, [customerId, customers, salesInvoice, selectedCustomer]);

  const canGoCustomerPrev = Boolean(customersMeta?.hasPrevPage) && !isCustomersFetching;
  const canGoCustomerNext = Boolean(customersMeta?.hasNextPage) && !isCustomersFetching;

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue('head.customer_id', String(customer.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('head.customer_id');
    setIsCustomerModalOpen(false);
  };

  const onSubmit = async (data: UpdateSalesInvoiceFormInput) => {
    if (!id) return;
    try {
      setFormError(null);
      const headPayload: Record<string, unknown> = {
        customer_id: data.head.customer_id,
        status: data.head.status,
        invoice_date: data.head.invoice_date,
      };

      if (data.head.sales_order_id) {
        headPayload.sales_order_id = data.head.sales_order_id;
      }

      await updateMutation.mutateAsync({ id, payload: headPayload });
      toast.success('Sales Invoice berhasil diperbarui');
      navigate('/sales/sales-invoices');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as SalesInvoiceApiErrorResponse;
        const fieldMessage = responseData?.errors?.invoice_number?.[0];
        if (fieldMessage) {
          setError('head.invoice_number', { type: 'server', message: fieldMessage });
        }
        const salesOrderMessage = responseData?.errors?.sales_order_id?.[0];
        if (salesOrderMessage) {
          setError('head.sales_order_id', { type: 'server', message: salesOrderMessage });
        }
        const customerMessage = responseData?.errors?.customer_id?.[0];
        if (customerMessage) {
          setError('head.customer_id', { type: 'server', message: customerMessage });
        }
        const invoiceDateMessage = responseData?.errors?.invoice_date?.[0];
        if (invoiceDateMessage) {
          setError('head.invoice_date', { type: 'server', message: invoiceDateMessage });
        }
        const statusMessage = responseData?.errors?.status?.[0];
        if (statusMessage) {
          setError('head.status', { type: 'server', message: statusMessage });
        }
        setFormError(responseData?.message ?? 'Gagal memperbarui Sales Invoice');
      } else {
        setFormError('Terjadi kesalahan yang tidak terduga');
      }
    }
  };

  if (isHeadLoading || isItemsLoading) {
    return <div className="p-8 text-center">Loading sales invoice data...</div>;
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
                <Link to="/sales/sales-invoices">Sales Invoices</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit {salesInvoice?.invoice_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Edit Sales Invoice</CardTitle>
          <CardDescription>Perbarui data Sales Invoice header.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Head</p>
                <p className="text-sm text-text">Informasi utama Sales Invoice</p>
              </div>
            </div>

            <input type="hidden" {...register('head.customer_id')} />
            <input type="hidden" {...register('head.sales_order_id')} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Nomor Invoice</Label>
                <Input id="invoice-number" {...register('head.invoice_number')} readOnly className="bg-surface-2" />
                {errors.head?.invoice_number?.message && <p className="text-sm text-red-600">{errors.head.invoice_number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-date">Tanggal Invoice</Label>
                <Input id="invoice-date" type="date" {...register('head.invoice_date')} />
                {errors.head?.invoice_date?.message && <p className="text-sm text-red-600">{errors.head.invoice_date.message}</p>}
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register('head.status')}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Sales Invoice Items</p>
                <p className="text-sm text-text">Daftar item pada Sales Invoice</p>
              </div>
              <p className="text-xs text-text">
                {isItemsFetching ? 'Memuat...' : itemsData?.meta ? `Total ${itemsData.meta.total} item` : ''}
              </p>
            </div>

            <SalesInvoiceItemsTable
              data={itemsData?.items ?? []}
              isLoading={isItemsLoading}
              isError={isItemsError}
              rowStartNumber={itemsData?.meta.from ?? 1}
            />
          </section>

          {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{formError}</div>}

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={() => navigate('/sales/sales-invoices')} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isCustomersLoading}>
              {isSubmitting ? 'Memperbarui...' : 'Perbarui Sales Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Modal Pilih Customer */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Pilih Customer</DialogTitle>
            <DialogDescription>Pilih customer untuk Sales Invoice ini.</DialogDescription>
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
