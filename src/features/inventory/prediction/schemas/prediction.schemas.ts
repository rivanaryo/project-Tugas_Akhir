import { z } from 'zod';
import type { ModelMetrics, PredictionResult } from '../types/prediction.types';

export const modelMetricsSchema = z.object({
  mae: z.number(),
  rmse: z.number(),
  test_size: z.number(),
  n_estimators: z.number(),
  feature_columns: z.array(z.string()),
});

export const predictionResultSchema = z.object({
  product_id: z.string(),
  predicted_demand_total: z.number(),
  safety_stock: z.number(),
  reorder_point: z.number(),
  current_stock: z.number(),
  reorder_recommended: z.boolean(),
  suggested_order_quantity: z.number(),
});

export const predictionInputSchema = z.object({
  product_id: z.string().trim().min(1, 'Product wajib dipilih'),
  warehouse_id: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().trim().optional()
  ),
  days_to_predict: z.coerce.number().int().positive().min(1, 'Minimal 1 hari').default(7),
});

const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: dataSchema,
  });

const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string().trim().min(1),
});

const throwApiError = (payload: unknown) => {
  const parsed = apiErrorResponseSchema.safeParse(payload);
  if (parsed.success) {
    throw new Error(parsed.data.message);
  }
};

export const parseModelMetricsResponse = (payload: unknown): ModelMetrics => {
  throwApiError(payload);
  const wrapped = createApiResponseSchema(modelMetricsSchema).safeParse(payload);
  if (wrapped.success) {
    return wrapped.data.data;
  }

  const direct = modelMetricsSchema.safeParse(payload);
  if (direct.success) {
    return direct.data;
  }

  throw new Error('Gagal memproses respon metrik model');
};

export const parsePredictionResponse = (payload: unknown): PredictionResult => {
  throwApiError(payload);
  const wrapped = createApiResponseSchema(predictionResultSchema).safeParse(payload);
  if (wrapped.success) {
    return wrapped.data.data;
  }

  const direct = predictionResultSchema.safeParse(payload);
  if (direct.success) {
    return direct.data;
  }

  throw new Error('Gagal memproses respon prediksi');
};

export type PredictionInput = z.infer<typeof predictionInputSchema>;
