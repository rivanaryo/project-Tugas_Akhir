import { useQuery } from '@tanstack/react-query';
import { workOrderService } from '../services/workOrderService';

export const useWorkOrder = (id: string | null) => {
	return useQuery({
		queryKey: ['production', 'work-orders', id],
		queryFn: () => workOrderService.fetchWorkOrder(id as string),
		enabled: Boolean(id),
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: 1,
	});
};
