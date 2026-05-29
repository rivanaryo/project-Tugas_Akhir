import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => productService.deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'products'],
      });
    },
  });
};
