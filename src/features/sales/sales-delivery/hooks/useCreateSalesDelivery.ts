import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesDeliveryService } from '../services/salesDelivery.service';
import type { CreateSalesDeliveryFormInput } from '../schemas/salesDelivery.schemas';

export const useCreateSalesDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSalesDeliveryFormInput) => {
      const headResult = await salesDeliveryService.createHead(payload.head);

      for (const item of payload.items) {
        // Ensure tax_rate is a valid number or undefined, avoiding NaN
        const taxRate = item.tax_rate !== null && item.tax_rate !== undefined 
          ? Number(item.tax_rate) 
          : undefined;

        await salesDeliveryService.createItem(headResult.sales_delivery_id, {
          sales_order_item_id: String(item.sales_order_item_id),
          qty_delivered: Math.floor(Number(item.qty_delivered)), // Ensure integer as per schema
          tax_rate: (taxRate !== undefined && !isNaN(taxRate)) ? taxRate : undefined,
        });
      }

      return headResult;
    },
    onSuccess: async () => {
      // Invalidate list queries with exact match
      await queryClient.invalidateQueries({ 
        queryKey: ['sales', 'sales-deliveries'],
        type: 'active'
      });
    },
  });
};

