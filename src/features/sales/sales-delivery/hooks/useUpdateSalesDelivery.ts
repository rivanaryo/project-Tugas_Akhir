import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';
import type { UpdateSalesDeliveryHeadInput, SalesDeliveryItem } from '../schemas/salesDelivery.schemas';



interface UpdateSalesDeliveryPayload {
  id: string | number;
  payload: {
    head: UpdateSalesDeliveryHeadInput;
    items?: SalesDeliveryItem[]; // For future implementation if needed
  };
}

export const useUpdateSalesDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSalesDeliveryPayload) => salesDeliveryService.updateHead(id, payload.head),
    onSuccess: async () => {
      // Only invalidate list queries (user navigates away after update, so no need to refetch detail)
      await queryClient.invalidateQueries({ 
        queryKey: ['sales', 'sales-deliveries'],
        type: 'active'
      });
    },
  });
};

