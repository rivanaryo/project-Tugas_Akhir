import { useQuery } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';

export const useGoodReceipt = (id?: string | number) => {
  return useQuery({
    queryKey: ['purchase', 'good-receipts', 'detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('goodReceiptId is required');
      }

      return goodReceiptService.fetchGoodReceipt(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};
