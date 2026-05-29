import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';

interface UseSalesInvoiceItemsParams {
  invoiceId: string | number | undefined;
  page: number;
  perPage?: number;
}

export const useSalesInvoiceItems = ({ invoiceId, page, perPage = 15 }: UseSalesInvoiceItemsParams) => {
  return useQuery({
    queryKey: ['sales', 'sales-invoice-items', invoiceId, page, perPage],
    queryFn: () => {
      if (invoiceId === undefined) {
        throw new Error('Sales invoice id is required');
      }
      return salesInvoiceService.fetchSalesInvoiceItems(invoiceId, page, perPage);
    },
    enabled: invoiceId !== undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
