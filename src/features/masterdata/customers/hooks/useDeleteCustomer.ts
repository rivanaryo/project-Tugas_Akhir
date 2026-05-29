import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => customerService.deleteCustomer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'customers'],
      });
    },
  });
};
