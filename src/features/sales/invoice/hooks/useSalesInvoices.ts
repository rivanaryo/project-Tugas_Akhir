import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';
import type { SalesInvoiceFilterParams } from '../types/salesInvoices';

interface UseSalesInvoicesParams {
  page: number;
  perPage?: number;
  filters?: SalesInvoiceFilterParams;
}

export const useSalesInvoices = ({ page, perPage = 15, filters = {} }: UseSalesInvoicesParams) => {
  return useQuery({
    // 🔑 PERBAIKAN: Bongkar filter menjadi string primitif agar nilainya konsisten saat dicek oleh React Query
    queryKey: [
      'sales', 
      'sales-invoices', 
      page, 
      perPage, 
      filters.q, 
      filters.status, 
      filters.customer_id, 
      filters.invoice_date_from, 
      filters.invoice_date_to
    ],
    queryFn: () => salesInvoiceService.fetchSalesInvoices(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
};
