import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unitService } from '../services/unitService';
import type { UpdateUnitInput } from '../schemas/unit.schema';

interface UpdateUnitPayload {
  id: string | number;
  data: UpdateUnitInput;
}

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateUnitPayload) => unitService.updateUnit(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'units'],
      });
    },
  });
};
