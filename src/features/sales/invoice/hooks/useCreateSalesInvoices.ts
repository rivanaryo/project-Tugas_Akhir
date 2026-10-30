import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';

type CreateSalesInvoicePayload = {
  head: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
};

export const useCreateSalesInvoice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalesInvoicePayload) => salesInvoiceService.createSalesInvoice({ ...payload.head, items: payload.items ?? [] }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['sales', 'sales-invoices'] }),
  });
};
