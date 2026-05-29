import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import type { CreateProductInput } from '../schemas/product.schema';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => productService.createProduct(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'products'],
      });
    },
  });
};
