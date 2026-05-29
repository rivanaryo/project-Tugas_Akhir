import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { UpdateCategoryInput } from '../schemas/category.schema';

interface UpdateCategoryPayload {
  id: string | number;
  data: UpdateCategoryInput;
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCategoryPayload) => categoryService.updateCategory(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'categories'],
      });
    },
  });
};