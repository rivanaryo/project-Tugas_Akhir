import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';
import type { UpdateSalesOrderHeadInput } from '../schemas/salesOrder.schemas';

interface UpdateSalesOrderPayload {
  id: string | number;
  payload: {
    head: UpdateSalesOrderHeadInput;
    items?: any[]; // For future implementation if needed
  };
}

export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSalesOrderPayload) => salesOrderService.updateHead(id, payload.head),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['sales', 'sales-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['sales', 'sales-orders', 'detail', String(variables.id)] });
    },
  });
};

