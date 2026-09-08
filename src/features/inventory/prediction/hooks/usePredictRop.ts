import { useMutation } from '@tanstack/react-query';
import { predictionService } from '../services/prediction.service';
import type { PredictionInput } from '../schemas/prediction.schemas';

export const usePredictRop = () => {
  return useMutation({
    mutationFn: (input: PredictionInput) => predictionService.predict(input),
  });
};
