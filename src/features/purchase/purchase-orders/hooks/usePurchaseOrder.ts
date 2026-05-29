import { useQuery } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';

export const usePurchaseOrder = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['purchase', 'purchase-orders', 'detail', id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error('Purchase order id is required');
      }
      return purchaseOrderService.fetchPurchaseOrder(id);
    },
    enabled: id !== undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

