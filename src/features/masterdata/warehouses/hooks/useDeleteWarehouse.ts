import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouseService';

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => warehouseService.deleteWarehouse(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'warehouses'],
      });
    },
  });
};
