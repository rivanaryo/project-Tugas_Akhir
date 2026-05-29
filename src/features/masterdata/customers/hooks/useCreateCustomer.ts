import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCustomerInput } from '../schemas/customer.schema';
import { customerService } from '../services/customerService';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerInput) => customerService.createCustomer(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'customers'],
      });
    },
  });
};
