import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../services/stockMovement.service';
import type { UpdateStockMovementInput } from '../schemas/stockMovement.schemas';

export const useUpdateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateStockMovementInput }) => {
      return await stockMovementService.updateStockMovement(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['inventory', 'stock-movements'],
        type: 'active',
      });
    },
  });
};
