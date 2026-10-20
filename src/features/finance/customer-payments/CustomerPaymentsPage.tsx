import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { customerPaymentService } from './customerPayment.service';

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
  const queryClient = useQueryClient();
  const paymentsQuery = useQuery({ queryKey: ['finance', 'customer-payments'], queryFn: customerPaymentService.list });
  const deleteMutation = useMutation({
    mutationFn: customerPaymentService.remove,
    onSuccess: async (message) => {
      await queryClient.invalidateQueries({ queryKey: ['finance', 'customer-payments'] });
      toast.success(message);
    },
    onError: () => toast.error('Pembayaran customer gagal dihapus'),
  });
  const payments = paymentsQuery.data ?? [];
  const totalPaid = payments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalPending = payments.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div><CardTitle className="text-2xl">Customer Payments</CardTitle><CardDescription>Pencatatan penerimaan DP dan pelunasan dari pelanggan.</CardDescription></div>
            <Button asChild size="sm"><Link to="/finance/customer-payments/create"><Plus className="h-4 w-4" />Catat Pembayaran</Link></Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-text">Total Diterima</p><p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-text">Total Pending</p><p className="text-2xl font-bold text-amber-400">{formatCurrency(totalPending)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Data Pembayaran Customer</CardTitle></CardHeader>
        <CardContent>
          {paymentsQuery.isLoading && <p className="text-sm text-text">Memuat pembayaran customer...</p>}
          {paymentsQuery.isError && <p className="text-sm text-rose-400">Pembayaran customer gagal dimuat.</p>}
          {!paymentsQuery.isLoading && !paymentsQuery.isError && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2"><tr><th className="px-4 py-3">Nomor</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Sales Order</th><th className="px-4 py-3">Tipe</th><th className="px-4 py-3">Akun</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3 text-right">Jumlah</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
                <tbody className="divide-y divide-border bg-surface-1">
                  {payments.map((payment) => <tr key={payment.id}><td className="px-4 py-3 font-semibold text-text-h">{payment.payment_number}</td><td className="px-4 py-3 text-text">{payment.customer?.customer_name ?? payment.customer_id}</td><td className="px-4 py-3 text-text">{payment.sales_order?.order_number ?? payment.sales_order_id}</td><td className="px-4 py-3"><Badge variant={typeConfig[payment.type].variant}>{typeConfig[payment.type].label}</Badge></td><td className="px-4 py-3 text-text">{payment.account?.account_name ?? payment.account_id}</td><td className="px-4 py-3 text-text">{payment.payment_date ?? '-'}</td><td className="px-4 py-3 text-right font-medium text-text-h">{formatCurrency(Number(payment.amount))}</td><td className="px-4 py-3"><Badge variant={statusConfig[payment.status].variant}>{statusConfig[payment.status].label}</Badge></td><td className="px-4 py-3 text-center"><Button type="button" size="sm" variant="destructive" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm(`Hapus pembayaran ${payment.payment_number}?`)) deleteMutation.mutate(payment.id); }}><Trash2 className="h-4 w-4" /></Button></td></tr>)}
                  {payments.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-text">Belum ada pembayaran customer.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
