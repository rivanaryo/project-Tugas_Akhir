import { useQuery } from '@tanstack/react-query';
import { vendorPaymentService } from '../services/VendorPayment.service';

export const useVendorPayment = (id?: string | number) => {
  return useQuery({
    queryKey: ['purchase', 'vendor-payments', 'detail', id],
    queryFn: () => {
      if (!id) throw new Error('vendorPaymentId is required');
      return vendorPaymentService.fetchVendorPayment(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};

