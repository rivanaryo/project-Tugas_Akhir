import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { vendorPaymentService } from '../services/VendorPayment.service';
import type { VendorPaymentFilterParams } from '../types/VendorPayment';

interface UseVendorPaymentsParams {
  page: number;
  perPage?: number;
  filters?: VendorPaymentFilterParams;
}

export const useVendorPayments = ({ page, perPage = 15, filters = {} }: UseVendorPaymentsParams) => {
  return useQuery({
    queryKey: ['purchase', 'vendor-payments', page, perPage, filters],
    queryFn: () => vendorPaymentService.fetchVendorPayments(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};