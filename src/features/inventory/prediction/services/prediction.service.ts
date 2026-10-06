import api from '../../../../lib/api';
import {
  parseModelMetricsResponse,
  parsePredictionResponse,
  predictionInputSchema,
  type PredictionInput,
} from '../schemas/prediction.schemas';

export const predictionService = {
  fetchModelMetrics: async () => {
    const response = await api.get('inventory/rop/model-metrics');
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

    const response = await api.post('inventory/rop/predict', payload);
    return parsePredictionResponse(response.data);
  },
};
