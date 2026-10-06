import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';
import type { UpdateGoodReceiptHeadInput } from '../schemas/goodReceipt.schema';

interface UpdateGoodReceiptPayload {
  id: string | number;
  data: UpdateGoodReceiptHeadInput;
}

export const useUpdateGoodReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateGoodReceiptPayload) => goodReceiptService.updateHead(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts', 'detail', variables.id] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipt-items', variables.id] });
    },
  });
};
