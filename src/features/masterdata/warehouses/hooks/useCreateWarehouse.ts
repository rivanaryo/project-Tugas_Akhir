import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouseService';
import type { CreateWarehouseInput } from '../schemas/warehouse.schema';

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWarehouseInput) => warehouseService.createWarehouse(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'warehouses'],
      });
    },
  });
};
