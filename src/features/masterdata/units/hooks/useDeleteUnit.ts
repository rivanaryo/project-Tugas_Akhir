import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unitService } from '../services/unitService';

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => unitService.deleteUnit(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'units'],
      });
    },
  });
};
