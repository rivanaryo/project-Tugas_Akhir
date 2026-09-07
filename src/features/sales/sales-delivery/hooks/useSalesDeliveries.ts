import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';
import type { SalesDeliveryFilterParams } from '../types/salesDelivery.types';

interface UseSalesDeliveriesParams {
  page: number;
  perPage?: number;
  filters?: SalesDeliveryFilterParams;
}

export const useSalesDeliveries = ({ page, perPage = 15, filters = {} }: UseSalesDeliveriesParams) => {
  return useQuery({
    queryKey: [
      'sales',
      'sales-deliveries',
      page,
      perPage,
      filters.q ?? '',
      String(filters.status ?? ''),
      String(filters.customer_id ?? ''),
      String(filters.product_id ?? ''),
      String(filters.delivery_date_from ?? ''),
      String(filters.delivery_date_to ?? ''),
    ],
    queryFn: () => salesDeliveryService.fetchSalesDeliveries(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
