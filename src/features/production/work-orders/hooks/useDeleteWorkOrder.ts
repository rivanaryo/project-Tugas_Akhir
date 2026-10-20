import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workOrderService } from '../services/workOrderService';

export const useDeleteWorkOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workOrderService.deleteWorkOrder(id),
		onSuccess: (result) => {
			toast.success(result.message);
			queryClient.invalidateQueries({ queryKey: ['production', 'work-orders'] });
		},
		onError: () => {
			toast.error('Gagal menghapus Work Order');
		},
	});
};
