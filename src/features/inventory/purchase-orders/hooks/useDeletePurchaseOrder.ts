import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => purchaseOrderService.deletePurchaseOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'purchase-orders'] });
    },
  });
};

