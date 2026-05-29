import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../services/accountService';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => accountService.deleteAccount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'accounts'],
      });
    },
  });
};
