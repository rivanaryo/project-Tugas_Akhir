import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';

interface UsePurchaseOrderItemsParams {
  purchaseOrderId: string | number | undefined;
  page: number;
  perPage?: number;
}

export const usePurchaseOrderItems = ({ purchaseOrderId, page, perPage = 15 }: UsePurchaseOrderItemsParams) => {
  return useQuery({
    queryKey: ['purchase', 'purchase-order-items', purchaseOrderId, page, perPage],
    queryFn: () => {
      if (purchaseOrderId === undefined) {
        throw new Error('Purchase order id is required');
      }
      return purchaseOrderService.fetchPurchaseOrderItems(purchaseOrderId, page, perPage);
    },
    enabled: purchaseOrderId !== undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

