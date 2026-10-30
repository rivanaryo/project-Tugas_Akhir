import { Package, Warehouse, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../../../../components/ui/skeleton';
import type { StockBalanceSummary } from '../types/stockBalance.types';

interface StockBalanceSummaryCardsProps {
  summary: StockBalanceSummary;
  isLoading: boolean;
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

function SummaryCard({ label, value, icon, color, isLoading }: SummaryCardProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-border/80 bg-surface-1 p-4`}>
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-12" />
        ) : (
          <p className="metric-number text-lg font-bold text-text-h">{value.toLocaleString('id-ID')}</p>
        )}
      </div>
    </div>
  );
}

export function StockBalanceSummaryCards({ summary, isLoading }: StockBalanceSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Produk Unik"
        value={summary.totalProducts}
        icon={<Package className="h-5 w-5 text-blue-400" />}
        color="bg-blue-500/10"
        isLoading={isLoading}
      />
      <SummaryCard
        label="Gudang Unik"
        value={summary.totalWarehouses}
        icon={<Warehouse className="h-5 w-5 text-violet-600" />}
        color="bg-violet-50"
        isLoading={isLoading}
      />
      <SummaryCard
        label="Stok Positif"
        value={summary.safeStockCount}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        color="bg-emerald-500/10"
        isLoading={isLoading}
      />
      <SummaryCard
        label="Stok Negatif"
        value={summary.negativeStockCount}
        icon={<AlertTriangle className="h-5 w-5 text-rose-400" />}
        color="bg-rose-500/10"
        isLoading={isLoading}
      />
    </div>
  );
}
