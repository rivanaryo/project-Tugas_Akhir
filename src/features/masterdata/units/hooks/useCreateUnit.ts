import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unitService } from '../services/unitService';
import type { CreateUnitInput } from '../schemas/unit.schema';

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUnitInput) => unitService.createUnit(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'units'],
      });
    },
  });
};
