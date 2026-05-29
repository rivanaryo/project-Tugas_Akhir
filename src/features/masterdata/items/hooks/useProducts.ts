import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { productService } from '../services/productService';

interface UseProductsParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useProducts = ({ page, perPage = 15, filters = {} }: UseProductsParams) => {
  return useQuery({
    queryKey: ['masterdata', 'products', page, perPage, filters],
    queryFn: () => productService.fetchProducts(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
