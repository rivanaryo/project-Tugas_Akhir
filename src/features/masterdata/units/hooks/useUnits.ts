import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { unitService } from '../services/unitService';

interface UseUnitsParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useUnits = ({ page, perPage = 15, filters = {} }: UseUnitsParams) => {
  return useQuery({
    queryKey: ['masterdata', 'units', page, perPage, filters],
    queryFn: () => unitService.fetchUnits(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
