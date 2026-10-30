import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../services/stockMovement.service';
import type { CreateStockMovementInput } from '../schemas/stockMovement.schemas';

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStockMovementInput) => {
      return await stockMovementService.createStockMovement(payload);
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
