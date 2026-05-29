import { useMutation } from '@tanstack/react-query';
import { salesOrderService } from '../services/salesOrder.service';
import type { CreateSalesOrderFormInput } from '../schemas/salesOrder.schemas';

export const useCreateSalesOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreateSalesOrderFormInput) => {
      const headResult = await salesOrderService.createHead(payload.head);

      for (const item of payload.items) {
        await salesOrderService.createItem(headResult.sales_order_id, {
          ...item,
          product_id: String(item.product_id),
          unit_price: Number(item.unit_price),
          tax_rate: Number(item.tax_rate),
        });
      }

      return headResult;
    },
  });
};

