import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';

export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => salesOrderService.deleteSalesOrder(id),
    onSuccess: async () => {
      // Invalidate list queries with exact match
      await queryClient.invalidateQueries({ 
        queryKey: ['sales', 'sales-orders'],
        type: 'active'
      });
    },
  });
};

