import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { warehouseService } from '../services/warehouseService';

interface UseWarehousesParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useWarehouses = ({ page, perPage = 15, filters = {} }: UseWarehousesParams) => {
  return useQuery({
    queryKey: ['masterdata', 'warehouses', page, perPage, filters],
    queryFn: () => warehouseService.fetchWarehouses(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
