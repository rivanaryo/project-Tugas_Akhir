import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';
import type { SalesDeliveryFilterParams } from '../types/salesDelivery.types';

interface UseSalesDeliveriesParams {
  page: number;
  perPage?: number;
  filters?: SalesDeliveryFilterParams;
}

export const useSalesDeliveries = ({ perPage = 15, filters = {} }: UseSalesDeliveriesParams) => {
  return useQuery({
    queryKey: ['sales', 'sales-deliveries', perPage, filters],
    queryFn: () => salesDeliveryService.fetchSalesDeliveries(perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
