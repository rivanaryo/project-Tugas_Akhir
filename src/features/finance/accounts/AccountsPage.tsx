import { useQuery } from '@tanstack/react-query';
import { Landmark, Wallet } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import api from '../../../lib/api';

interface FinanceAccount {
  id: string;
  account_name: string;
  account_number: string;
  type: 'bank' | 'cash';
  balance: number | string;
  bank_name?: string | null;
  is_active: boolean;
}

interface FinanceAccountsResponse {
  success: boolean;
  data: {
    data: FinanceAccount[];
  };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export function AccountsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['finance-accounts'],
    queryFn: async () => {
      const response = await api.get<FinanceAccountsResponse>('/finance/accounts');
      return response.data.data.data;
    },
  });
  const accounts = data ?? [];
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cash & Bank Accounts</CardTitle>
          <CardDescription>Bagan akun rekening kas dan bank perusahaan.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-text">Total Balance</p>
          <p className="text-4xl font-bold text-text-h">{formatCurrency(totalBalance)}</p>
        </CardContent>
      </Card>

      {isLoading && <p className="text-sm text-text">Memuat akun finance...</p>}
      {isError && <p className="text-sm text-rose-400">Akun finance gagal dimuat.</p>}
      {!isLoading && !isError && accounts.length === 0 && <p className="text-sm text-text">Belum ada akun finance.</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => (
          <Card key={account.id} className="transition-colors hover:border-accent/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
                  {account.type === 'cash' ? <Wallet className="h-6 w-6" /> : <Landmark className="h-6 w-6" />}
                </div>
                <Badge variant={account.is_active ? 'success' : 'default'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="mt-4 space-y-1">
                <p className="font-semibold text-text-h">{account.account_name}</p>
                <p className="text-xs text-text">{account.bank_name || (account.type === 'cash' ? 'Cash' : 'Bank')}</p>
                <p className="text-xs text-text">{account.account_number}</p>
              </div>
              <p className="mt-3 text-2xl font-bold text-text-h">{formatCurrency(Number(account.balance))}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
