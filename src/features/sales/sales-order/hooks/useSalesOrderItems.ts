import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';

interface UseSalesOrderItemsParams {
  salesOrderId: string | number | undefined;
  page: number;
  perPage?: number;
}

export const useSalesOrderItems = ({ salesOrderId, page, perPage = 15 }: UseSalesOrderItemsParams) => {
  return useQuery({
    queryKey: ['sales', 'sales-order-items', salesOrderId, page, perPage],
    queryFn: () => {
      if (salesOrderId === undefined) {
        throw new Error('Sales order id is required');
      }
      return salesOrderService.fetchSalesOrderItems(salesOrderId, page, perPage);
    },
    enabled: salesOrderId !== undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

