import { Skeleton } from '../../../../components/ui/skeleton';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { getApiErrorMessage, isServiceUnavailable } from '../services/predictionError';
import type { ModelMetrics } from '../types/prediction.types';

interface ModelMetricsPanelProps {
  metrics: ModelMetrics | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function MetricCard({ label, value, isLoading }: { label: string; value: string; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface-1/80 p-4 shadow-default">
      <p className="text-xs font-medium text-text">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-6 w-24" />
      ) : (
        <p className="mt-1 text-xl font-semibold text-text-h metric-number">{value}</p>
      )}
    </div>
  );
}

export function ModelMetricsPanel({ metrics, isLoading, error, onRetry }: ModelMetricsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-h">Metrik Model ML</h2>
          <p className="text-sm text-text">Performa model prediksi reorder point.</p>
        </div>
        {error ? (
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            Coba Lagi
          </Button>
        ) : null}
      </div>

      {error ? (
        <div
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
          role="alert"
        >
          <p className="font-medium">Gagal memuat metrik model</p>
          <p className="mt-1">{getApiErrorMessage(error)}</p>
          {isServiceUnavailable(error) ? (
            <p className="mt-2 text-xs">Kode HTTP 503 — layanan ML tidak tersedia.</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="MAE" value={metrics?.mae.toFixed(4) ?? '-'} isLoading={isLoading} />
        <MetricCard label="RMSE" value={metrics?.rmse.toFixed(4) ?? '-'} isLoading={isLoading} />
        <MetricCard
          label="Ukuran Test"
          value={metrics ? `${(metrics.test_size * 100).toFixed(0)}%` : '-'}
          isLoading={isLoading}
        />
        <MetricCard label="N Estimators" value={metrics?.n_estimators.toString() ?? '-'} isLoading={isLoading} />
      </div>

      <div className="rounded-xl border border-border bg-surface-1/80 p-4 shadow-default">
        <p className="text-xs font-medium text-text">Fitur yang Digunakan</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : metrics?.feature_columns.length ? (
            metrics.feature_columns.map((column) => (
              <Badge key={column} variant="default">
                {column}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-text">-</span>
          )}
        </div>
      </div>
    </div>
  );
}
