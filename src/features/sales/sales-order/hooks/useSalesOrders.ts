import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';
import type { SalesOrderFilterParams } from '../types/salesOrder.types';

interface UseSalesOrdersParams {
  page: number;
  perPage?: number;
  filters?: SalesOrderFilterParams;
}

export const useSalesOrders = ({ page, perPage = 15, filters = {} }: UseSalesOrdersParams) => {
  return useQuery({
    queryKey: [
      'sales',
      'sales-orders',
      page,
      perPage,
      filters.q ?? '',
      String(filters.status ?? ''),
      String(filters.customer_id ?? ''),
      String(filters.order_date_from ?? ''),
      String(filters.order_date_to ?? ''),
    ],
    queryFn: () => salesOrderService.fetchSalesOrders(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
