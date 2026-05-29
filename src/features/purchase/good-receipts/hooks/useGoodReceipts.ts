import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';
import type { GoodReceiptFilterParams } from '../types/goodReceipt.types';

interface UseGoodReceiptsParams {
  page: number;
  perPage?: number;
  filters?: GoodReceiptFilterParams;
}

export const useGoodReceipts = ({ page, perPage = 15, filters = {} }: UseGoodReceiptsParams) => {
  return useQuery({
    queryKey: ['purchase', 'good-receipts', page, perPage, filters],
    queryFn: () => goodReceiptService.fetchGoodReceipts(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};
