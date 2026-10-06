import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { VendorPaymentFormValues } from '../schemas/VendorPayment.schemas';
import { vendorPaymentService } from '../services/VendorPayment.service';

interface UpdateVendorPaymentPayload {
  id: string | number;
  data: VendorPaymentFormValues;
}

export const useUpdateVendorPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateVendorPaymentPayload) => vendorPaymentService.updateVendorPayment(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'vendor-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase', 'vendor-payments', 'detail', variables.id] });
    },
  });
};

