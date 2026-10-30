import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stockBalanceService } from '../services/stockBalance.service';
import type { StockBalanceFilterParams } from '../types/stockBalance.types';

interface UseStockBalanceParams {
  page: number;
  perPage?: number;
  filters?: StockBalanceFilterParams;
}

export const useStockBalance = ({ page, perPage = 15, filters = {} }: UseStockBalanceParams) => {
  return useQuery({
    queryKey: ['inventory', 'stock-balance', page, perPage, filters],
    queryFn: () => stockBalanceService.fetchStockBalance(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
