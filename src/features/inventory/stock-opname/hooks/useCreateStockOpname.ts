import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockOpnameService } from '../services/stockOpname.service';
import type { CreateStockOpnameInput } from '../schemas/stockOpname.schemas';

export const useCreateStockOpname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStockOpnameInput) => {
      return await stockOpnameService.createStockOpname(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['inventory', 'stock-opnames'],
        type: 'active',
      });
    },
  });
};
