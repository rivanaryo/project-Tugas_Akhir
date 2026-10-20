import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Landmark, RefreshCcw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { financeAccountService } from './financeAccount.service';
import type { AdjustmentPayload, FinanceAccount, TransferPayload } from './financeAccount.types';

const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
const today = now.toISOString().slice(0, 10);
const formatCurrency = (value: number | string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));

export function AccountsPage() {
  const queryClient = useQueryClient();
  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(today);
  const [selectedAccount, setSelectedAccount] = useState<FinanceAccount | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const accountsQuery = useQuery({ queryKey: ['finance', 'accounts'], queryFn: financeAccountService.accounts });
  const summaryQuery = useQuery({ queryKey: ['finance', 'accounts', 'summary', dateFrom, dateTo], queryFn: () => financeAccountService.summary({ date_from: dateFrom, date_to: dateTo }) });
  const transactionsQuery = useQuery({
    queryKey: ['finance', 'accounts', selectedAccount?.id, 'transactions', dateFrom, dateTo],
    queryFn: () => financeAccountService.transactions(selectedAccount!.id, { date_from: dateFrom, date_to: dateTo }),
    enabled: Boolean(selectedAccount),
  });
  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeAccountService.voidTransaction(id, reason),
    onSuccess: async (message) => { await invalidateFinance(queryClient); toast.success(message); },
    onError: () => toast.error('Transaksi gagal di-void'),
  });
  const accounts = accountsQuery.data ?? [];
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <Card><CardHeader><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><CardTitle className="text-2xl">Cash & Bank Accounts</CardTitle><CardDescription>Saldo, dana masuk, dana keluar, dan mutasi rekening.</CardDescription></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => setIsAdjustmentOpen(true)}>Adjustment</Button><Button size="sm" onClick={() => setIsTransferOpen(true)}>Transfer Antar Akun</Button></div></div></CardHeader></Card>

      <Card><CardContent className="grid gap-4 p-4 md:grid-cols-3"><div><Label>Dari Tanggal</Label><Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></div><div><Label>Sampai Tanggal</Label><Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div><div className="flex items-end"><Button type="button" variant="secondary" onClick={() => void summaryQuery.refetch()}><RefreshCcw className="h-4 w-4" />Refresh</Button></div></CardContent></Card>

      {summaryQuery.isError && <p className="text-sm text-rose-400">Ringkasan akun gagal dimuat.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Saldo Awal" value={summary?.opening_balance ?? 0} />
        <SummaryCard label="Dana Masuk" value={summary?.cash_in ?? 0} color="text-emerald-400" />
        <SummaryCard label="Dana Keluar" value={summary?.cash_out ?? 0} color="text-rose-400" />
        <SummaryCard label="Saldo Akhir" value={summary?.closing_balance ?? 0} color="text-accent" />
      </div>

      {accountsQuery.isLoading && <p className="text-sm text-text">Memuat akun finance...</p>}
      {accountsQuery.isError && <p className="text-sm text-rose-400">Akun finance gagal dimuat.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {accounts.map((account) => {
          const accountSummary = summary?.accounts.find((item) => item.id === account.id);
          return <Card key={account.id} className="cursor-pointer transition-colors hover:border-accent/50" onClick={() => setSelectedAccount(account)}><CardContent className="space-y-4 p-5"><div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">{account.type === 'cash' ? <Wallet className="h-6 w-6" /> : <Landmark className="h-6 w-6" />}</div><Badge variant={account.is_active ? 'success' : 'default'}>{account.is_active ? 'Active' : 'Inactive'}</Badge></div><div><p className="font-semibold text-text-h">{account.account_name}</p><p className="text-xs text-text">{account.account_number || account.bank_name || '-'}</p></div><p className="text-2xl font-bold text-text-h">{formatCurrency(accountSummary?.current_balance ?? account.balance)}</p><div className="grid grid-cols-2 gap-2 text-xs"><span className="text-emerald-400">Masuk {formatCurrency(accountSummary?.cash_in ?? 0)}</span><span className="text-right text-rose-400">Keluar {formatCurrency(accountSummary?.cash_out ?? 0)}</span></div><p className="text-xs font-medium text-accent">Klik untuk melihat mutasi</p></CardContent></Card>;
        })}
      </div>

      <Dialog open={Boolean(selectedAccount)} onOpenChange={(open) => !open && setSelectedAccount(null)}><DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto"><DialogHeader><DialogTitle>Mutasi {selectedAccount?.account_name}</DialogTitle><DialogDescription>{dateFrom} sampai {dateTo}</DialogDescription></DialogHeader>{transactionsQuery.isLoading && <p className="text-sm text-text">Memuat mutasi...</p>}{transactionsQuery.isError && <p className="text-sm text-rose-400">Mutasi gagal dimuat.</p>}<div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-sm"><thead className="bg-surface-2"><tr><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Referensi</th><th className="px-3 py-2">Deskripsi</th><th className="px-3 py-2">Arah</th><th className="px-3 py-2 text-right">Jumlah</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Aksi</th></tr></thead><tbody className="divide-y divide-border">{(transactionsQuery.data ?? []).map((transaction) => <tr key={transaction.id}><td className="px-3 py-2">{transaction.transaction_date}</td><td className="px-3 py-2 font-medium">{transaction.reference_number ?? transaction.reference_type}</td><td className="px-3 py-2 text-text">{transaction.description ?? '-'}</td><td className="px-3 py-2">{transaction.direction === 'in' ? <span className="flex items-center gap-1 text-emerald-400"><ArrowDownLeft className="h-4 w-4" />Masuk</span> : <span className="flex items-center gap-1 text-rose-400"><ArrowUpRight className="h-4 w-4" />Keluar</span>}</td><td className="px-3 py-2 text-right font-semibold">{formatCurrency(transaction.amount)}</td><td className="px-3 py-2"><Badge variant={transaction.status === 'posted' ? 'success' : 'default'}>{transaction.status}</Badge></td><td className="px-3 py-2">{transaction.status === 'posted' && <Button type="button" size="sm" variant="destructive" disabled={voidMutation.isPending} onClick={() => { const reason = window.prompt('Alasan void transaksi:'); if (reason?.trim()) voidMutation.mutate({ id: transaction.id, reason: reason.trim() }); }}>Void</Button>}</td></tr>)}{!transactionsQuery.isLoading && (transactionsQuery.data ?? []).length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-text">Belum ada mutasi pada periode ini.</td></tr>}</tbody></table></div></DialogContent></Dialog>

      <AdjustmentDialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen} accounts={accounts} />
      <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} accounts={accounts} />
    </div>
  );
}

function SummaryCard({ label, value, color = 'text-text-h' }: { label: string; value: number | string; color?: string }) {
  return <Card><CardContent className="p-5"><p className="text-sm text-text">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{formatCurrency(value)}</p></CardContent></Card>;
}

function AdjustmentDialog({ open, onOpenChange, accounts }: { open: boolean; onOpenChange: (open: boolean) => void; accounts: FinanceAccount[] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdjustmentPayload>({ account_id: '', direction: 'in', amount: 0, transaction_date: today, description: '' });
  const mutation = useMutation({ mutationFn: financeAccountService.adjust, onSuccess: async (message) => { await invalidateFinance(queryClient); toast.success(message); onOpenChange(false); }, onError: () => toast.error('Adjustment akun gagal dibuat') });
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Adjustment Akun</DialogTitle><DialogDescription>Catat koreksi dana masuk atau dana keluar.</DialogDescription></DialogHeader><div className="space-y-4"><FormSelect label="Akun" value={form.account_id} onChange={(value) => setForm({ ...form, account_id: value })}>{accounts.filter((account) => account.is_active).map((account) => <option key={account.id} value={account.id}>{account.account_name}</option>)}</FormSelect><FormSelect label="Arah" value={form.direction} onChange={(value) => setForm({ ...form, direction: value as 'in' | 'out' })}><option value="in">Dana Masuk</option><option value="out">Dana Keluar</option></FormSelect><FormInput label="Jumlah" type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: Number(value) })} /><FormInput label="Tanggal" type="date" value={form.transaction_date} onChange={(value) => setForm({ ...form, transaction_date: value })} /><FormInput label="Deskripsi" value={form.description} onChange={(value) => setForm({ ...form, description: value })} /></div><DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button><Button disabled={mutation.isPending || !form.account_id || form.amount <= 0 || !form.description.trim()} onClick={() => mutation.mutate(form)}>Simpan Adjustment</Button></DialogFooter></DialogContent></Dialog>;
}

function TransferDialog({ open, onOpenChange, accounts }: { open: boolean; onOpenChange: (open: boolean) => void; accounts: FinanceAccount[] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TransferPayload>({ source_account_id: '', destination_account_id: '', amount: 0, transaction_date: today, description: '' });
  const mutation = useMutation({ mutationFn: financeAccountService.transfer, onSuccess: async (message) => { await invalidateFinance(queryClient); toast.success(message); onOpenChange(false); }, onError: () => toast.error('Transfer antar akun gagal') });
  const activeAccounts = accounts.filter((account) => account.is_active);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Transfer Antar Akun</DialogTitle><DialogDescription>Pindahkan saldo antar akun kas atau bank.</DialogDescription></DialogHeader><div className="space-y-4"><FormSelect label="Akun Sumber" value={form.source_account_id} onChange={(value) => setForm({ ...form, source_account_id: value })}>{activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.account_name}</option>)}</FormSelect><FormSelect label="Akun Tujuan" value={form.destination_account_id} onChange={(value) => setForm({ ...form, destination_account_id: value })}>{activeAccounts.filter((account) => account.id !== form.source_account_id).map((account) => <option key={account.id} value={account.id}>{account.account_name}</option>)}</FormSelect><FormInput label="Jumlah" type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: Number(value) })} /><FormInput label="Tanggal" type="date" value={form.transaction_date} onChange={(value) => setForm({ ...form, transaction_date: value })} /><FormInput label="Deskripsi" value={form.description ?? ''} onChange={(value) => setForm({ ...form, description: value })} /></div><DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button><Button disabled={mutation.isPending || !form.source_account_id || !form.destination_account_id || form.amount <= 0} onClick={() => mutation.mutate(form)}>Transfer</Button></DialogFooter></DialogContent></Dialog>;
}

function FormInput({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) { return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} min={type === 'number' ? 0 : undefined} onChange={(event) => onChange(event.target.value)} /></div>; }
function FormSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label><Select value={value} onChange={(event) => onChange(event.target.value)}><option value="">Pilih {label.toLowerCase()}</option>{children}</Select></div>; }
async function invalidateFinance(queryClient: ReturnType<typeof useQueryClient>) { await queryClient.invalidateQueries({ queryKey: ['finance', 'accounts'] }); }
