import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateCustomerInput } from '../schemas/customer.schema';
import { customerService } from '../services/customerService';

interface UpdateCustomerPayload {
  id: string | number;
  data: UpdateCustomerInput;
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCustomerPayload) => customerService.updateCustomer(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'customers'],
      });
    },
  });
};
