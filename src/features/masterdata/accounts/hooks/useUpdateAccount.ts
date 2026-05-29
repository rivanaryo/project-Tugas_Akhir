import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateAccountInput } from '../schemas/account.schema';
import { accountService } from '../services/accountService';

interface UpdateAccountPayload {
  id: string | number;
  data: UpdateAccountInput;
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateAccountPayload) => accountService.updateAccount(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'accounts'],
      });
    },
  });
};
