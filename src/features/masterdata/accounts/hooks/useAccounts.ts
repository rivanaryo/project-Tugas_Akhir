import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { accountService } from '../services/accountService';

interface UseAccountsParams {
  page: number;
  perPage?: number;
  filters?: MasterdataListFilterParams;
}

export const useAccounts = ({ page, perPage = 15, filters = {} }: UseAccountsParams) => {
  return useQuery({
    queryKey: ['masterdata', 'accounts', page, perPage, filters],
    queryFn: () => accountService.fetchAccounts(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
