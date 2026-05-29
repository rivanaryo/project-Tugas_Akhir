import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateVendorInput } from '../schemas/vendor.schema';
import { vendorService } from '../services/vendorService';

interface UpdateVendorPayload {
  id: string | number;
  data: UpdateVendorInput;
}

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateVendorPayload) => vendorService.updateVendor(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'vendors'],
      });
    },
  });
};
