import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';

export const useDeleteSalesInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => salesInvoiceService.deleteSalesInvoice(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sales', 'sales-invoices'] });
    },
  });
};
