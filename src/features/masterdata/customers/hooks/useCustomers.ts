import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { customerService } from '../services/customerService';

interface UseCustomersParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useCustomers = ({ page, perPage = 15, filters = {} }: UseCustomersParams) => {
  return useQuery({
    queryKey: ['masterdata', 'customers', page, perPage, filters],
    queryFn: () => customerService.fetchCustomers(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
