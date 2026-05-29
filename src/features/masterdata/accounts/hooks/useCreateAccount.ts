import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateAccountInput } from '../schemas/account.schema';
import { accountService } from '../services/accountService';

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountInput) => accountService.createAccount(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'accounts'],
      });
    },
  });
};
