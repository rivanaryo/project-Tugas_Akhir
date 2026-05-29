import { useMutation } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { CreatePurchaseOrderFormInput } from '../schemas/purchaseOrder.schema';

export const useCreatePurchaseOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreatePurchaseOrderFormInput) => {
      const headResult = await purchaseOrderService.createHead(payload.head);

      for (const item of payload.items) {
        await purchaseOrderService.createItem(headResult.purchase_order_id, item);
      }

      return headResult;
    },
  });
};

