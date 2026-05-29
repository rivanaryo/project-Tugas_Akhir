import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateVendorInput } from '../schemas/vendor.schema';
import { vendorService } from '../services/vendorService';

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVendorInput) => vendorService.createVendor(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'vendors'],
      });
    },
  });
};
