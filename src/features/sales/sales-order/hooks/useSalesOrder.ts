import { useQuery } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';

export const useSalesOrder = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['sales', 'sales-orders', 'detail', id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error('Sales order id is required');
      }
      return salesOrderService.fetchSalesOrder(id);
    },
    enabled: id !== undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

