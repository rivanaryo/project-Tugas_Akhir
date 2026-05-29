import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';

export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => salesOrderService.deleteSalesOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sales', 'sales-orders'] });
    },
  });
};

