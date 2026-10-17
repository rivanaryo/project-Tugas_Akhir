import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';
import type { CreateGoodReceiptFormInput } from '../schemas/goodReceipt.schema';

export const useCreateGoodReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGoodReceiptFormInput) => {
      return goodReceiptService.createHead(
        payload.head,
        (payload.items ?? []).map((item) => ({
          purchase_order_item_id: item.purchase_order_item_id,
          qty_received: item.qty_received,
        }))
      );
    },
    onSuccess: () => {
      // Invalidate purchase order queries to get updated status
      queryClient.invalidateQueries({ queryKey: ['purchase', 'purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-balance'] });
    },
  });
};
