import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';
import type { CreateGoodReceiptFormInput } from '../schemas/goodReceipt.schema';

export const useCreateGoodReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGoodReceiptFormInput) => {
      const headResult = await goodReceiptService.createHead(payload.head);

      if (payload.items && payload.items.length > 0) {
        for (const item of payload.items) {
          await goodReceiptService.createItem(headResult.good_receipt_id, {
            purchase_order_item_id: item.purchase_order_item_id,
            qty_received: item.qty_received,
          });
        }
      }

      return headResult;
    },
    onSuccess: () => {
      // Invalidate purchase order queries to get updated status
      queryClient.invalidateQueries({ queryKey: ['purchase', 'purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts'] });
    },
  });
};
