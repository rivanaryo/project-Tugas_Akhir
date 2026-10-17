import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';

export const useDeleteGoodReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => goodReceiptService.deleteGoodReceipt(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts', 'detail', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipt-items', id] });
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
      await queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-balance'] });
    },
  });
};
