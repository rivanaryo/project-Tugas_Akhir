import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { CreateCategoryInput } from '../schemas/category.schema';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => categoryService.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'categories'],
      });
    },
  });
};