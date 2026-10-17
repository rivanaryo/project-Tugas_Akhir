import { useQuery } from '@tanstack/react-query';
import { Banknote, CreditCard } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import api from '../../../lib/api';

interface CustomerPayment {
  id: string;
  payment_number: string;
  sales_order_id: string;
  sales_order?: { id: string; order_number: string } | null;
  customer_id: string;
  customer?: { id: string; customer_name: string } | null;
  type: 'dp' | 'pelunasan';
  amount: number | string;
  account_id: string;
  account?: { id: string; account_name: string } | null;
  payment_date: string;
  status: 'paid' | 'pending';
}

interface CustomerPaymentsResponse {
  success: boolean;
  data: CustomerPayment[] | {
    data: CustomerPayment[];
  };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const statusConfig = {
  paid: { label: 'Paid', variant: 'success' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
};

const typeConfig = {
  dp: { label: 'DP', variant: 'info' as const },
  pelunasan: { label: 'Pelunasan', variant: 'default' as const },
};

export function CustomerPaymentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['customer-payments'],
    queryFn: async () => {
      const response = await api.get<CustomerPaymentsResponse>('/finance/customer-payments');
      const payload = response.data.data;
      return Array.isArray(payload) ? payload : payload.data;
    },
  });
  const payments = data ?? [];
  const totalPaid = payments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalPending = payments.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Customer Payments</CardTitle>
          <CardDescription>Pencatatan penerimaan DP dan pelunasan dari pelanggan.</CardDescription>
        </CardHeader>
      </Card>

      {isLoading && <p className="text-sm text-text">Memuat pembayaran customer...</p>}
      {isError && <p className="text-sm text-rose-400">Pembayaran customer gagal dimuat.</p>}
      {!isLoading && !isError && payments.length === 0 && <p className="text-sm text-text">Belum ada pembayaran customer.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-h">{payment.payment_number}</p>
                    <p className="text-xs text-text">{payment.customer?.customer_name ?? payment.customer_id}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={statusConfig[payment.status].variant}>{statusConfig[payment.status].label}</Badge>
                  <Badge variant={typeConfig[payment.type].variant}>{typeConfig[payment.type].label}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-text">Sales Order</p><p className="font-medium text-text-h">{payment.sales_order?.order_number ?? payment.sales_order_id}</p></div>
                <div><p className="text-text">Akun</p><p className="font-medium text-text-h">{payment.account?.account_name ?? payment.account_id}</p></div>
                <div><p className="text-text">Tanggal</p><p className="font-medium text-text-h">{payment.payment_date}</p></div>
                <div><p className="text-text">Jumlah</p><p className="font-medium text-text-h">{formatCurrency(Number(payment.amount))}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Ringkasan Pembayaran</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-2/30 p-4 text-center"><p className="text-sm text-text">Total Diterima</p><p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p></div>
          <div className="rounded-xl border border-border bg-surface-2/30 p-4 text-center"><p className="text-sm text-text">Pending</p><p className="text-2xl font-bold text-amber-400">{formatCurrency(totalPending)}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
