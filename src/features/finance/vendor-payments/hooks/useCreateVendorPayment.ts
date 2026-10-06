import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorPaymentService } from '../services/VendorPayment.service';
import type { VendorPaymentFormValues } from '../schemas/VendorPayment.schemas';

export const useCreateVendorPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorPaymentFormValues) => vendorPaymentService.createVendorPayment(payload),
    onSuccess: () => {
      // Invalidate and refetch vendor payments queries
      queryClient.invalidateQueries({ queryKey: ['purchase', 'vendor-payments'] });
    },
  });
};