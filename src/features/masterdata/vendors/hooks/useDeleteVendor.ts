import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../services/vendorService';

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => vendorService.deleteVendor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'vendors'],
      });
    },
  });
};
