import { useQuery } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';

export const useSalesInvoice = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['sales', 'sales-invoices', 'detail', id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error('Sales invoice id is required');
      }
      return salesInvoiceService.fetchSalesInvoice(id);
    },
    enabled: id !== undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
