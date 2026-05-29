import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesInvoiceService } from '../services/salesInvoice.services';



interface UpdateSalesInvoicePayload {
  id: string | number;
  payload: Record<string, unknown>;
}

export const useUpdateSalesInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSalesInvoicePayload) => salesInvoiceService.updateSalesInvoice(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['sales', 'sales-invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['sales', 'sales-invoices', 'detail', String(variables.id)] });
    },
  });
};
