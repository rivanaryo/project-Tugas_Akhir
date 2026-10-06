import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderFilterParams } from '../types/purchaseOrder.types';

interface UsePurchaseOrdersParams {
  page: number;
  perPage?: number;
  filters?: PurchaseOrderFilterParams;
}

export const usePurchaseOrders = ({ page, perPage = 15, filters = {} }: UsePurchaseOrdersParams) => {
  return useQuery({
    queryKey: ['purchase', 'purchase-orders', page, perPage, filters],
    queryFn: () => purchaseOrderService.fetchPurchaseOrders(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
