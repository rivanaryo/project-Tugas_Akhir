import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodReceiptService } from '../services/goodReceiptService';
import type { CreateGoodReceiptItemInput, UpdateGoodReceiptItemInput } from '../schemas/goodReceipt.schema';

const useInvalidateGoodReceiptItems = () => {
  const queryClient = useQueryClient();
  return (goodReceiptId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipt-items'] });
    queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts'] });
    if (goodReceiptId !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['purchase', 'good-receipts', 'detail', goodReceiptId] });
    }
    queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-movements'] });
    queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-balance'] });
  };
};

export const useCreateGoodReceiptItem = (goodReceiptId?: string | number) => {
  const invalidate = useInvalidateGoodReceiptItems();
  return useMutation({
    mutationFn: (payload: CreateGoodReceiptItemInput) => {
      if (goodReceiptId === undefined) throw new Error('goodReceiptId is required');
      return goodReceiptService.createItem(goodReceiptId, payload);
    },
    onSuccess: () => invalidate(goodReceiptId),
  });
};

export const useUpdateGoodReceiptItem = (goodReceiptId?: string | number) => {
  const invalidate = useInvalidateGoodReceiptItems();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string | number; data: UpdateGoodReceiptItemInput }) =>
      goodReceiptService.updateItem(itemId, data),
    onSuccess: () => invalidate(goodReceiptId),
  });
};

export const useDeleteGoodReceiptItem = (goodReceiptId?: string | number) => {
  const invalidate = useInvalidateGoodReceiptItems();
  return useMutation({
    mutationFn: (itemId: string | number) => goodReceiptService.deleteItem(itemId),
    onSuccess: () => invalidate(goodReceiptId),
  });
};
