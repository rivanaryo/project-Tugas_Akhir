import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { useCustomers } from '../../masterdata/customers/hooks/useCustomers';
import { useSalesOrders } from '../../sales/sales-order/hooks/useSalesOrders';
import { customerPaymentService } from './customerPayment.service';

const paymentSchema = z.object({
  payment_number: z.string().trim().min(1, 'Nomor pembayaran wajib diisi'),
  sales_order_id: z.string().min(1, 'Sales order wajib dipilih'),
  customer_id: z.string().min(1, 'Customer wajib dipilih'),
  type: z.enum(['dp', 'pelunasan']),
  amount: z.coerce.number().gt(0, 'Jumlah pembayaran harus lebih dari 0'),
  account_id: z.string().min(1, 'Akun wajib dipilih'),
  payment_date: z.string().optional(),
  status: z.enum(['paid', 'pending']),
});

type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentFormValues = z.output<typeof paymentSchema>;

export function CreateCustomerPaymentPage() {
  const navigate = useNavigate();
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [salesOrderSearch, setSalesOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const customersQuery = useCustomers({ page: 1, perPage: 1000 });
  const salesOrdersQuery = useSalesOrders({ page: 1, perPage: 1000 });
  const accountsQuery = useQuery({ queryKey: ['finance', 'accounts', 'references'], queryFn: customerPaymentService.accounts });
  const customers = customersQuery.data?.items ?? [];
  const salesOrders = salesOrdersQuery.data?.items ?? [];
  const accounts = (accountsQuery.data ?? []).filter((account) => account.is_active);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_number: '', sales_order_id: '', customer_id: '', type: 'dp', amount: 0,
      account_id: '', payment_date: new Date().toISOString().slice(0, 10), status: 'paid',
    },
  });
  const selectedSalesOrderId = watch('sales_order_id');
  const selectedCustomerId = watch('customer_id');
  const selectedSalesOrder = salesOrders.find((order) => String(order.id) === selectedSalesOrderId);
  const selectedCustomer = customers.find((customer) => String(customer.id) === selectedCustomerId);
  const filteredSalesOrders = salesOrders.filter((order) => `${order.order_number} ${order.customer?.customer_name ?? ''}`.toLowerCase().includes(salesOrderSearch.trim().toLowerCase()));
  const filteredCustomers = customers.filter((customer) => customer.customer_name.toLowerCase().includes(customerSearch.trim().toLowerCase()));

  useEffect(() => {
    const order = salesOrders.find((item) => String(item.id) === selectedSalesOrderId);
    if (order?.customer_id) setValue('customer_id', String(order.customer_id), { shouldValidate: true });
  }, [salesOrders, selectedSalesOrderId, setValue]);

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      const result = await customerPaymentService.create(values);
      toast.success(result.message);
      navigate('/finance/customer-payments');
    } catch {
      toast.error('Pembayaran customer gagal dibuat. Periksa kembali data yang diisi.');
    }
  };

  return (
    <div className="space-y-6">
      <Card><CardHeader><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to="/finance/customer-payments">Customer Payments</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Create</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><CardTitle className="text-2xl">Catat Pembayaran Customer</CardTitle><CardDescription>Catat penerimaan DP atau pelunasan dari customer.</CardDescription></CardHeader></Card>

      <Card><CardContent className="p-6">
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Nomor Pembayaran" error={errors.payment_number?.message}><Input {...register('payment_number')} placeholder="PAY-2026-001" autoFocus /></Field>
          <Field label="Tanggal Pembayaran" error={errors.payment_date?.message}><Input type="date" {...register('payment_date')} /></Field>
          <Field label="Sales Order" error={errors.sales_order_id?.message}><input type="hidden" {...register('sales_order_id')} /><div className="flex gap-2"><Input readOnly value={selectedSalesOrder ? `${selectedSalesOrder.order_number}${selectedSalesOrder.customer?.customer_name ? ` - ${selectedSalesOrder.customer.customer_name}` : ''}` : ''} placeholder="Pilih sales order" /><Button type="button" variant="secondary" disabled={salesOrdersQuery.isLoading} onClick={() => setIsSalesOrderModalOpen(true)}>Pilih</Button></div></Field>
          <Field label="Customer" error={errors.customer_id?.message}><input type="hidden" {...register('customer_id')} /><div className="flex gap-2"><Input readOnly value={selectedCustomer?.customer_name ?? ''} placeholder="Pilih customer" /><Button type="button" variant="secondary" disabled={customersQuery.isLoading} onClick={() => setIsCustomerModalOpen(true)}>Pilih</Button></div></Field>
          <Field label="Tipe Pembayaran" error={errors.type?.message}><Select {...register('type')}><option value="dp">DP</option><option value="pelunasan">Pelunasan</option></Select></Field>
          <Field label="Jumlah Pembayaran" error={errors.amount?.message}><Input type="number" min="0.01" step="0.01" {...register('amount')} /></Field>
          <Field label="Akun Kas / Bank" error={errors.account_id?.message}><Select {...register('account_id')} disabled={accountsQuery.isLoading}><option value="">Pilih akun</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.account_name}{account.account_number ? ` - ${account.account_number}` : ''}</option>)}</Select></Field>
          <Field label="Status" error={errors.status?.message}><Select {...register('status')}><option value="paid">Paid</option><option value="pending">Pending</option></Select></Field>
          {(salesOrdersQuery.isError || customersQuery.isError || accountsQuery.isError) && <p className="text-sm text-rose-400 md:col-span-2">Sebagian data referensi gagal dimuat.</p>}
          <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" asChild><Link to="/finance/customer-payments">Batal</Link></Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}</Button></div>
        </form>
      </CardContent></Card>

      <Dialog open={isSalesOrderModalOpen} onOpenChange={(open) => { setIsSalesOrderModalOpen(open); if (!open) setSalesOrderSearch(''); }}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>Pilih Sales Order</DialogTitle><DialogDescription>Pilih sales order yang menerima pembayaran.</DialogDescription></DialogHeader>
          <Input value={salesOrderSearch} onChange={(event) => setSalesOrderSearch(event.target.value)} placeholder="Cari nomor SO atau customer..." autoFocus />
          {salesOrdersQuery.isLoading && <p className="text-sm text-text">Memuat sales order...</p>}
          {salesOrdersQuery.isError && <p className="text-sm text-rose-400">Sales order gagal dimuat.</p>}
          <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="px-4 py-3">Nomor SO</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-border">{filteredSalesOrders.map((order) => <tr key={order.id}><td className="px-4 py-3 font-semibold text-text-h">{order.order_number}</td><td className="px-4 py-3 text-text">{order.customer?.customer_name ?? order.customer_id}</td><td className="px-4 py-3 text-text">{order.order_date ?? '-'}</td><td className="px-4 py-3 text-text">{String(order.status)}</td><td className="px-4 py-3 text-right text-text-h">{new Intl.NumberFormat('id-ID').format(Number(order.grand_total ?? 0))}</td><td className="px-4 py-3"><Button type="button" size="sm" onClick={() => { setValue('sales_order_id', String(order.id), { shouldDirty: true, shouldValidate: true }); if (order.customer_id) setValue('customer_id', String(order.customer_id), { shouldDirty: true, shouldValidate: true }); setIsSalesOrderModalOpen(false); setSalesOrderSearch(''); }}>Pilih</Button></td></tr>)}{!salesOrdersQuery.isLoading && filteredSalesOrders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-text">Sales order tidak ditemukan.</td></tr>}</tbody></table></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerModalOpen} onOpenChange={(open) => { setIsCustomerModalOpen(open); if (!open) setCustomerSearch(''); }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>Pilih Customer</DialogTitle><DialogDescription>Pilih customer dari master data.</DialogDescription></DialogHeader>
          <Input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Cari nama customer..." autoFocus />
          {customersQuery.isLoading && <p className="text-sm text-text">Memuat customer...</p>}
          {customersQuery.isError && <p className="text-sm text-rose-400">Customer gagal dimuat.</p>}
          <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="px-4 py-3">Nama Customer</th><th className="px-4 py-3">Contact Person</th><th className="px-4 py-3">Telepon</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-border">{filteredCustomers.map((customer) => <tr key={customer.id}><td className="px-4 py-3 font-semibold text-text-h">{customer.customer_name}</td><td className="px-4 py-3 text-text">{customer.contact_person ?? '-'}</td><td className="px-4 py-3 text-text">{customer.phone_number ?? '-'}</td><td className="px-4 py-3 text-text">{customer.email ?? '-'}</td><td className="px-4 py-3"><Button type="button" size="sm" onClick={() => { setValue('customer_id', String(customer.id), { shouldDirty: true, shouldValidate: true }); setIsCustomerModalOpen(false); setCustomerSearch(''); }}>Pilih</Button></td></tr>)}{!customersQuery.isLoading && filteredCustomers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-text">Customer tidak ditemukan.</td></tr>}</tbody></table></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm text-rose-400">{error}</p>}</div>;
}
