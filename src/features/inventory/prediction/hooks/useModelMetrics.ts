import { useQuery } from '@tanstack/react-query';
import { predictionService } from '../services/prediction.service';

export const useModelMetrics = () => {
  return useQuery({
    queryKey: ['inventory', 'rop', 'model-metrics'],
    queryFn: predictionService.fetchModelMetrics,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
