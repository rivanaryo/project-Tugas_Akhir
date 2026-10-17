import { Badge } from '../../../../components/ui/badge';
import type { PredictionResult } from '../types/prediction.types';

interface PredictionResultPanelProps {
  result: PredictionResult;
}

function ResultCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1/80 p-4 shadow-default">
      <p className="text-xs font-medium text-text">{label}</p>
      <p className={`mt-1 text-2xl font-semibold metric-number ${accent ? 'text-accent' : 'text-text-h'}`}>{value}</p>
    </div>
  );
}

export function PredictionResultPanel({ result }: PredictionResultPanelProps) {
  const isSafe = !result.reorder_recommended;
  const statusVariant = isSafe ? 'success' : 'danger';
  const statusLabel = isSafe ? 'Stok Aman' : 'Perlu Restock';
  const panelBorder = isSafe ? 'border-emerald-200' : 'border-rose-500/30';
  const panelBg = isSafe ? 'bg-emerald-500/100/10' : 'bg-rose-500/10';

  const maxValue = Math.max(1, result.reorder_point || result.current_stock || 1);
  const ratioPercent = Math.min(100, Math.max(0, (result.current_stock / maxValue) * 100));
  const gaugeColor = isSafe ? 'bg-emerald-500/100' : 'bg-rose-500/100';

  return (
    <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-h">Hasil Prediksi</h2>
          <p className="text-sm text-text">Rekomendasi reorder point untuk produk terpilih.</p>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard label="Total Permintaan Prediksi" value={result.predicted_demand_total.toLocaleString('id-ID')} accent />
        <ResultCard label="Reorder Point" value={result.reorder_point.toLocaleString('id-ID')} />
        <ResultCard label="Stok Saat Ini" value={result.current_stock.toLocaleString('id-ID')} />
        <ResultCard label="Safety Stock" value={result.safety_stock.toLocaleString('id-ID')} />
        <ResultCard
          label="Kuantitas Pesanan yang Disarankan"
          value={result.suggested_order_quantity.toLocaleString('id-ID')}
          accent
        />
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text">Stok saat ini vs Reorder point</span>
          <span className="font-semibold text-text-h metric-number">
            {result.current_stock.toLocaleString('id-ID')} / {result.reorder_point.toLocaleString('id-ID')}
          </span>
        </div>
        <div
          className="h-4 w-full overflow-hidden rounded-full bg-surface-3"
          role="progressbar"
          aria-label="Perbandingan stok saat ini dengan reorder point"
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-valuenow={result.current_stock}
        >
          <div
            className={`h-full rounded-full ${gaugeColor} transition-all duration-500`}
            style={{ width: `${ratioPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
