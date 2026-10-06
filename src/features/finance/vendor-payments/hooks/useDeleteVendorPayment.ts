import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorPaymentService } from '../services/VendorPayment.service';

export const useDeleteVendorPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => vendorPaymentService.deleteVendorPayment(id),
    onSuccess: () => {
      // Invalidate and refetch vendor payments queries
      queryClient.invalidateQueries({ queryKey: ['purchase', 'vendor-payments'] });
    },
  });
};