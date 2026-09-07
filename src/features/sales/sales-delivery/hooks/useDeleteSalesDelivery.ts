import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';

export const useDeleteSalesDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => salesDeliveryService.deleteSalesDelivery(id),
    onSuccess: async () => {
      // Invalidate list queries with exact match
      await queryClient.invalidateQueries({ 
        queryKey: ['sales', 'sales-deliveries'],
        type: 'active'
      });
    },
  });
};

