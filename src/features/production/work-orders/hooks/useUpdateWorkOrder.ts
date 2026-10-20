import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workOrderService } from '../services/workOrderService';
import type { UpdateWorkOrderInput } from '../schemas/workOrder.schema';

export const useUpdateWorkOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkOrderInput }) =>
			workOrderService.updateWorkOrder(id, payload),
		onSuccess: (_data, variables) => {
			toast.success('Work Order berhasil diperbarui');
			queryClient.invalidateQueries({ queryKey: ['production', 'work-orders'] });
			queryClient.invalidateQueries({ queryKey: ['production', 'work-orders', variables.id] });
		},
		onError: () => {
			toast.error('Gagal memperbarui Work Order');
		},
	});
};
