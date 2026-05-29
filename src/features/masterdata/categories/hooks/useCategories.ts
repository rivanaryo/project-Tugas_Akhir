import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { categoryService } from '../services/categoryService';

interface UseCategoriesParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useCategories = ({ page, perPage = 15, filters = {} }: UseCategoriesParams) => {
  return useQuery({
    queryKey: ['masterdata', 'categories', page, perPage, filters],
    queryFn: () => categoryService.fetchCategories(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
