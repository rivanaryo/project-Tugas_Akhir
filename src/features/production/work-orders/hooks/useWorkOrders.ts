import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { workOrderService } from '../services/workOrderService';
import type { WorkOrderFilterParams } from '../types/workOrder.types';

interface UseWorkOrdersParams {
	page: number;
	perPage?: number;
	filters?: WorkOrderFilterParams;
}

export const useWorkOrders = ({ page, perPage = 15, filters = {} }: UseWorkOrdersParams) => {
	return useQuery({
		queryKey: [
			'production',
			'work-orders',
			page,
			perPage,
			filters.q ?? '',
			filters.status ?? '',
			filters.stage ?? '',
			filters.sales_order_id ?? '',
			filters.product_id ?? '',
			filters.date_from ?? '',
			filters.date_to ?? '',
		],
		queryFn: () => workOrderService.fetchWorkOrders(page, perPage, filters),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: 1,
	});
};
