import axios from 'axios';
import { env } from '../../../../config/env';
import {
  parseModelMetricsResponse,
  parsePredictionResponse,
  predictionInputSchema,
  type PredictionInput,
} from '../schemas/prediction.schemas';

const ropApiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export const predictionService = {
  fetchModelMetrics: async () => {
    const response = await ropApiClient.get('inventory/rop/model-metrics');
    return parseModelMetricsResponse(response.data);
  },

  predict: async (input: PredictionInput) => {
    const validated = predictionInputSchema.parse(input);
    const payload: { product_id: string; days_to_predict: number; warehouse_id?: string } = {
      product_id: validated.product_id,
      days_to_predict: validated.days_to_predict,
    };

    if (validated.warehouse_id) {
      payload.warehouse_id = validated.warehouse_id;
    }

    const response = await ropApiClient.post('inventory/rop/predict', payload);
    return parsePredictionResponse(response.data);
  },
};
