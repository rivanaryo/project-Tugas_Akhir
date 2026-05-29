import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import type { UpdateProductInput } from '../schemas/product.schema';

interface UpdateProductPayload {
  id: string | number;
  data: UpdateProductInput;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductPayload) => productService.updateProduct(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'products'],
      });
    },
  });
};
