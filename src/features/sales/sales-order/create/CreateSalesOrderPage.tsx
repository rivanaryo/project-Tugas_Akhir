"use no memo";

import { useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form';
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
import { useCustomers } from '../../../masterdata/customers/hooks/useCustomers';
import type { Customer } from '../../../masterdata/customers/types/customer.types';
import { useProducts } from '../../../masterdata/items/hooks/useProducts';
import type { Product } from '../../../masterdata/items/types/product.types';
import { useCreateSalesOrder } from '../hooks/useCreateSalesOrder';
import { createSalesOrderFormSchema, type CreateSalesOrderFormInput } from '../schemas/salesOrder.schemas';
import { Select } from '../../../../components/ui/select';

interface SalesOrderApiErrorResponse {
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

export function CreateSalesOrderPage() {
  "use no memo";

  const navigate = useNavigate();
  const createMutation = useCreateSalesOrder();

  const [formError, setFormError] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const customerFilters = useReferenceTableFilters(10);
  const productFilters = useReferenceTableFilters(10);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const scrollRef = useHorizontalScroll();

  const { data: customersData, isLoading: isCustomersLoading, isFetching: isCustomersFetching } = useCustomers({
    page: customerFilters.page,
    perPage: customerFilters.perPage,
    filters: customerFilters.queryFilters,
  });
  const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching } = useProducts({
    page: productFilters.page,
    perPage: productFilters.perPage,
    filters: productFilters.queryFilters,
  });

  const customers = customersData?.items ?? [];
  const customersMeta = customersData?.meta;
  const products = productsData?.items ?? [];
  const productsMeta = productsData?.meta;

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
  } = useForm<CreateSalesOrderFormInput>({
    resolver: zodResolver(createSalesOrderFormSchema) as Resolver<CreateSalesOrderFormInput>,
    defaultValues: {
      head: {
        order_number: '',
        customer_id: '',
        status: 'draft',
        order_date: today,
      },
      items: [{ product_id: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const customerId = useWatch({ control, name: 'head.customer_id', defaultValue: '' });
  const watchedItems = useWatch({ control, name: 'items' });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProductsById, setSelectedProductsById] = useState<Record<string, Product>>({});

  const selectedCustomerLabel = useMemo(() => {
    if (selectedCustomer) return selectedCustomer.customer_name;
    const fromPage = customers.find((item) => String(item.id) === String(customerId));
    return fromPage?.customer_name ?? '';
  }, [selectedCustomer, customers, customerId]);

  // Perhitungan Subtotal (sum of qty * unit_price)
  const subtotal = useMemo(() => {
    if (!Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce((total, item) => {
      const qty = Number(item?.quantity ?? 0);
      const price = Number(item?.unit_price ?? 0);
      return total + (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(price) ? price : 0);
    }, 0);
  }, [watchedItems]);

  // Perhitungan Total Tax
  const totalTax = useMemo(() => {
    if (!Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce((total, item) => {
      const qty = Number(item?.quantity ?? 0);
      const price = Number(item?.unit_price ?? 0);
      const taxRate = Number(item?.tax_rate ?? 0);
      
      const lineSubtotal = (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(price) ? price : 0);
      const lineTax = (lineSubtotal * (Number.isFinite(taxRate) ? taxRate : 0)) / 100;
      return total + lineTax;
    }, 0);
  }, [watchedItems]);

  // Perhitungan Grand Total
  const grandTotal = subtotal + totalTax;

  const canGoCustomerPrev = Boolean(customersMeta?.hasPrevPage) && !isCustomersFetching;
  const canGoCustomerNext = Boolean(customersMeta?.hasNextPage) && !isCustomersFetching;
  const canGoProductPrev = Boolean(productsMeta?.hasPrevPage) && !isProductsFetching;
  const canGoProductNext = Boolean(productsMeta?.hasNextPage) && !isProductsFetching;

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue('head.customer_id', String(customer.id), { shouldValidate: true, shouldDirty: true });
    clearErrors('head.customer_id');
    setIsCustomerModalOpen(false);
  };

  const handleOpenProductModal = (index: number) => {
    setActiveItemIndex(index);
    setIsProductModalOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    if (activeItemIndex === null) return;
    setSelectedProductsById((prev) => ({ ...prev, [String(product.id)]: product }));
    setValue(`items.${activeItemIndex}.product_id`, String(product.id), { shouldValidate: true, shouldDirty: true });
    clearErrors(`items.${activeItemIndex}.product_id`);
    setIsProductModalOpen(false);
  };

  const resolveProductLabel = (productIdValue: unknown) => {
    const key = String(productIdValue ?? '');
    if (!key) return '';
    if (selectedProductsById[key]) return selectedProductsById[key].product_name;
    const fromPage = products.find((item) => String(item.id) === key);
    return fromPage?.product_name ?? '';
  };

  const onSubmit = async (data: CreateSalesOrderFormInput) => {
    try {
      setFormError(null);
      await createMutation.mutateAsync(data);
      toast.success('Sales Order berhasil dibuat');
      navigate('/sales/sales-orders');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as SalesOrderApiErrorResponse;
        setFormError(data?.message ?? 'Gagal membuat Sales Order');
      } else {
        setFormError('Terjadi kesalahan yang tidak terduga');
      }
    }
  };

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
              <BreadcrumbPage>Create Sales Order</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Create Sales Order</CardTitle>
          <CardDescription>Buat Sales Order dengan head, item, dan total.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Head</p>
                <p className="text-sm text-text">Informasi utama Sales Order</p>
              </div>
            </div>

            <input type="hidden" {...register('head.customer_id')} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="so-number">Nomor SO</Label>
                <Input id="so-number" {...register('head.order_number')} placeholder="SO-2026-0001" autoFocus />
                {errors.head?.order_number?.message && <p className="text-sm text-rose-400">{errors.head.order_number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="so-date">Tanggal SO</Label>
                <Input id="so-date" type="date" {...register('head.order_date')} />
                {errors.head?.order_date?.message && <p className="text-sm text-rose-400">{errors.head.order_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Customer</Label>
                <div className="flex gap-2">
                  <Input value={selectedCustomerLabel} placeholder="Pilih customer" readOnly />
                  <Button type="button" variant="secondary" onClick={() => setIsCustomerModalOpen(true)}>
                    Pilih
                  </Button>
                </div>
                {errors.head?.customer_id?.message && <p className="text-sm text-rose-400">{errors.head.customer_id.message}</p>}
              </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register('head.status')}>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-h">Sales Order Items</p>
                <p className="text-sm text-text">Daftar item yang dipesan</p>
              </div>

              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => append({ product_id: '', quantity: 1, unit_price: 0, tax_rate: 0 })}
              >
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>

            <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
              <table className="min-w-[1000px] w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surface-2">
                  <tr>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">No</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Produk</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Qty</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Harga Satuan</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h">Tax Rate (%)</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Tax Amount</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Total Price</th>
                    <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {fields.map((field, index) => {
                    const item = watchedItems?.[index];
                    const qty = Number(item?.quantity ?? 0);
                    const price = Number(item?.unit_price ?? 0);
                    const taxRate = Number(item?.tax_rate ?? 0);
                    
                    const safeQty = Number.isFinite(qty) ? qty : 0;
                    const safePrice = Number.isFinite(price) ? price : 0;
                    const safeTaxRate = Number.isFinite(taxRate) ? taxRate : 0;
                    
                    const lineSubtotal = safeQty * safePrice;
                    const lineTaxAmount = (lineSubtotal * safeTaxRate) / 100;
                    const lineTotalPrice = lineSubtotal + lineTaxAmount;

                    return (
                      <tr key={field.id} className="hover:bg-surface-2/30">
                        <td className="px-4 py-3 text-text-h font-medium">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Input
                              value={resolveProductLabel(item?.product_id)}
                              placeholder="Pilih produk"
                              readOnly
                              className={errors.items?.[index]?.product_id ? 'border-red-600' : ''}
                            />
                            <Button type="button" variant="secondary" size="sm" onClick={() => handleOpenProductModal(index)}>
                              Pilih
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                            className="w-20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            {...register(`items.${index}.unit_price` as const, { valueAsNumber: true })}
                            className="w-32"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            {...register(`items.${index}.tax_rate` as const, { valueAsNumber: true })}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-text-h font-semibold">
                          {formatCurrency(lineTaxAmount)}
                        </td>
                        <td className="px-4 py-3 text-right text-text-h font-semibold">
                          {formatCurrency(lineTotalPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-rose-400 hover:bg-rose-500/10"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
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
          </section>

          <section className="flex flex-col items-end gap-2 p-4">
            <div className="grid w-full max-w-xs grid-cols-2 gap-2 text-sm">
              <span className="text-text">Subtotal:</span>
              <span className="text-right font-semibold text-text-h">{formatCurrency(subtotal)}</span>
              
              <span className="text-text">Total Tax:</span>
              <span className="text-right font-semibold text-text-h">{formatCurrency(totalTax)}</span>
              
              <div className="col-span-2 my-1 border-t border-border" />
              
              <span className="text-lg font-bold text-text-h">Grand Total:</span>
              <span className="text-right text-lg font-bold text-accent">{formatCurrency(grandTotal)}</span>
            </div>
          </section>

          {formError && <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/30">{formError}</div>}

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="secondary" onClick={() => navigate('/sales/sales-orders')} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isCustomersLoading}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Sales Order'}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Modal Pilih Customer */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Pilih Customer</DialogTitle>
            <DialogDescription>Pilih customer untuk Sales Order ini.</DialogDescription>
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
                  onClick={() => customerFilters.updateSearch(customerFilters.q)}
                  disabled={!canGoCustomerPrev}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => customerFilters.updateSearch(customerFilters.q)}
                  disabled={!canGoCustomerNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pilih Produk */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Pilih Produk</DialogTitle>
            <DialogDescription>Cari dan pilih produk yang akan ditambahkan.</DialogDescription>
            <div className="mt-4">
              <MasterdataSearchBar  
                onReset={() => productFilters.updateSearch('')}
                value={productFilters.q}
                onChange={(val) => productFilters.updateSearch(val)}
                placeholder="Cari produk..."
              />
            </div>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto p-6 pt-2">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isProductsLoading ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={2}>
                      Loading products...
                    </td>
                  </tr>
                ) : visibleProducts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={2}>
                      Tidak ada data produk.
                    </td>
                  </tr>
                ) : (
                  visibleProducts.map((product) => (
                    <tr key={product.id} className="border-t border-border/50 hover:bg-surface-2/50">
                      <td className="px-4 py-3 font-medium text-text-h">{product.product_name}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleSelectProduct(product)}>
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
                {productsMeta ? `Halaman ${productsMeta.currentPage} dari ${productsMeta.lastPage}` : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => productFilters.updateSearch(productFilters.q)}
                  disabled={!canGoProductPrev}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => productFilters.updateSearch(productFilters.q)}
                  disabled={!canGoProductNext}
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
