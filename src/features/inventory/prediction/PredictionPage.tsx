import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ModelMetricsPanel } from './components/ModelMetricsPanel';
import { PredictionForm } from './components/PredictionForm';
import { PredictionResultPanel } from './components/PredictionResultPanel';
import { useModelMetrics } from './hooks/useModelMetrics';
import { usePredictRop } from './hooks/usePredictRop';
import { getApiErrorMessage } from './services/predictionError';
import type { PredictionInput } from './schemas/prediction.schemas';
import type { PredictionResult } from './types/prediction.types';

export function PredictionPage() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const {
    data: metrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    error: metricsError,
    refetch: refetchMetrics,
  } = useModelMetrics();
  const predictMutation = usePredictRop();

  const handlePredict = async (input: PredictionInput) => {
    setPredictionResult(null);
    setPredictionError(null);

    try {
      const result = await predictMutation.mutateAsync(input);
      setPredictionResult(result);
      toast.success('Prediksi berhasil dibuat.');
    } catch (error) {
      const message = getApiErrorMessage(error);
      setPredictionError(message);
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inventory">Inventory</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Prediksi ROP</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="space-y-1">
          <CardTitle>Prediksi Reorder Point</CardTitle>
          <CardDescription>Prediksi kebutuhan stok dan reorder point berdasarkan model ML.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <ModelMetricsPanel
          metrics={metrics}
          isLoading={isMetricsLoading}
          error={isMetricsError ? metricsError : null}
          onRetry={refetchMetrics}
        />

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-text-h">Form Prediksi</h2>
            <p className="text-sm text-text">Pilih product, warehouse opsional, dan jumlah hari prediksi.</p>
          </div>
          <PredictionForm onSubmit={handlePredict} isPending={predictMutation.isPending} />
        </div>

        {predictionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            <p className="font-medium">Gagal membuat prediksi</p>
            <p className="mt-1">{predictionError}</p>
          </div>
        ) : null}

        {predictionResult ? <PredictionResultPanel result={predictionResult} /> : null}
      </CardContent>
    </Card>
  );
}
