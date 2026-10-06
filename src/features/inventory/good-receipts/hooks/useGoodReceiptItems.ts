import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';

interface UseGoodReceiptItemsParams {
  goodReceiptId?: string | number;
  page: number;
  perPage?: number;
}

export const useGoodReceiptItems = ({ goodReceiptId, page, perPage = 15 }: UseGoodReceiptItemsParams) => {
  return useQuery({
    queryKey: ['purchase', 'good-receipt-items', goodReceiptId, page, perPage],
    queryFn: () => {
      if (!goodReceiptId) throw new Error('goodReceiptId is required');
      return goodReceiptService.fetchGoodReceiptItems(goodReceiptId, page, perPage);
    },
    enabled: Boolean(goodReceiptId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};
