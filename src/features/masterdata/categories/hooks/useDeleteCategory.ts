import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => categoryService.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'categories'],
      });
    },
  });
};