import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workOrderService } from '../services/workOrderService';
import type { CreateWorkOrderInput } from '../schemas/workOrder.schema';

export const useCreateWorkOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateWorkOrderInput) => workOrderService.createWorkOrder(payload),
		onSuccess: () => {
			toast.success('Work Order berhasil dibuat');
			queryClient.invalidateQueries({ queryKey: ['production', 'work-orders'] });
		},
		onError: () => {
			toast.error('Gagal membuat Work Order');
		},
	});
};
