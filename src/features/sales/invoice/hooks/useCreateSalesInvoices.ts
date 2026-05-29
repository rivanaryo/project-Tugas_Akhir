import { useMutation } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';

type CreateSalesInvoicePayload = {
  head: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
};

export const useCreateSalesInvoice = () => {
  return useMutation({
    mutationFn: async (payload: CreateSalesInvoicePayload) => {
      const headResult = await salesInvoiceService.createSalesInvoice(payload.head);

      const invoiceId = headResult.sales_invoice_id;
      const items = payload.items ?? [];

      for (const item of items) {
        await salesInvoiceService.createSalesInvoiceItem(invoiceId, item);
      }

      return headResult;
    },
  });
};
