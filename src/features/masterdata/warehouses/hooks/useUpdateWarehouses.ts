import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouseService';
import type { UpdateWarehouseInput } from '../schemas/warehouse.schema';

interface UpdateWarehousePayload {
  id: string | number;
  data: UpdateWarehouseInput;
}

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateWarehousePayload) => warehouseService.updateWarehouse(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['masterdata', 'warehouses'],
      });
    },
  });
};
