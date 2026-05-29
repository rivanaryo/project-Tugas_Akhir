import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { pricelistService } from '../services/pricelistService';

interface UsePricelistsParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const usePricelists = ({ page, perPage = 15, filters = {} }: UsePricelistsParams) => {
  return useQuery({
    queryKey: ['masterdata', 'pricelists', page, perPage, filters],
    queryFn: () => pricelistService.fetchPricelists(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
