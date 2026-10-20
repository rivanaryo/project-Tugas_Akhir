import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workOrderService } from '../services/workOrderService';
import type { UpdateWorkOrderStageInput } from '../schemas/workOrder.schema';

export const useUpdateWorkOrderStage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkOrderStageInput }) =>
			workOrderService.updateWorkOrderStage(id, payload),
		onSuccess: () => {
			toast.success('Stage Work Order berhasil diperbarui');
			queryClient.invalidateQueries({ queryKey: ['production', 'work-orders'] });
		},
		onError: () => {
			toast.error('Gagal memperbarui stage Work Order');
		},
	});
};
