import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stockOpnameService } from '../services/stockOpname.service';
import type { StockOpnameFilterParams } from '../types/stockOpname.types';

interface UseStockOpnamesParams {
  page: number;
  perPage?: number;
  filters?: StockOpnameFilterParams;
}

export const useStockOpnames = ({ page, perPage = 15, filters = {} }: UseStockOpnamesParams) => {
  return useQuery({
    queryKey: [
      'inventory',
      'stock-opnames',
      page,
      perPage,
      filters.q ?? '',
      filters.status ?? '',
      filters.warehouse_id ?? '',
      filters.date_from ?? '',
      filters.date_to ?? '',
    ],
    queryFn: () => stockOpnameService.fetchStockOpnames(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
