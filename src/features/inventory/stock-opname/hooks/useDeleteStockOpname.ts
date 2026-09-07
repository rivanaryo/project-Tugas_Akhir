import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockOpnameService } from '../services/stockOpname.service';

export const useDeleteStockOpname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await stockOpnameService.deleteStockOpname(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['inventory', 'stock-opnames'],
        type: 'active',
      });
    },
  });
};
