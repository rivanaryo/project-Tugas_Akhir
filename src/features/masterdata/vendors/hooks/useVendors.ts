import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { vendorService } from '../services/vendorService';

interface UseVendorsParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useVendors = ({ page, perPage = 15, filters = {} }: UseVendorsParams) => {
  return useQuery({
    queryKey: ['masterdata', 'vendors', page, perPage, filters],
    queryFn: () => vendorService.fetchVendors(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
