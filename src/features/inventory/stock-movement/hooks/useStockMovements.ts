import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../services/stockMovement.service';
import type { StockMovementFilterParams } from '../types/stockMovement.types';

interface UseStockMovementsParams {
  page: number;
  perPage?: number;
  filters?: StockMovementFilterParams;
}

export const useStockMovements = ({ page, perPage = 15, filters = {} }: UseStockMovementsParams) => {
  return useQuery({
    queryKey: [
      'inventory',
      'stock-movements',
      page,
      perPage,
      filters.q ?? '',
      String(filters.type ?? ''),
      String(filters.product_id ?? ''),
      String(filters.warehouse_id ?? ''),
      String(filters.date_from ?? ''),
      String(filters.date_to ?? ''),
    ],
    queryFn: () => stockMovementService.fetchStockMovements(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
