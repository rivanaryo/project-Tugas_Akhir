import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { UpdatePurchaseOrderHeadInput } from '../schemas/purchaseOrder.schema';

interface UpdatePurchaseOrderPayload {
  id: string | number;
  data: UpdatePurchaseOrderHeadInput;
}

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePurchaseOrderPayload) => purchaseOrderService.updateHead(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'purchase-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'purchase-orders', 'detail', variables.id] });
    },
  });
};

