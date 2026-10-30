import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockOpnameService } from '../services/stockOpname.service';
import type { UpdateStockOpnameInput } from '../schemas/stockOpname.schemas';

export const useUpdateStockOpname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateStockOpnameInput }) => {
      return await stockOpnameService.updateStockOpname(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['inventory'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'products'],
      });
    },
  });
};
