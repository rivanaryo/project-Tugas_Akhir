import { useQuery } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';

export const useSalesDelivery = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['sales', 'sales-deliveries', 'detail', id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error('Sales delivery id is required');
      }
      return salesDeliveryService.fetchSalesDelivery(id);
    },
    enabled: id !== undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

