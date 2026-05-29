import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';

interface UseSalesDeliveryItemsParams {
  salesDeliveryId: string | number | undefined;
  page: number;
  perPage?: number;
}

export const useSalesDeliveryItems = ({ salesDeliveryId, page, perPage = 15 }: UseSalesDeliveryItemsParams) => {
  return useQuery({
    queryKey: ['sales', 'sales-delivery-items', salesDeliveryId, page, perPage],
    queryFn: () => {
      if (salesDeliveryId === undefined) {
        throw new Error('Sales delivery id is required');
      }
      return salesDeliveryService.fetchSalesDeliveryItems(salesDeliveryId, page, perPage);
    },
    enabled: salesDeliveryId !== undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

