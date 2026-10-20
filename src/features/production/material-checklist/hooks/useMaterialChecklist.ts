import { useQuery } from '@tanstack/react-query';
import { materialChecklistService } from '../services/materialChecklistService';
import type { MaterialChecklistFilterParams } from '../types/materialChecklist.types';

export const useMaterialChecklist = (filters: MaterialChecklistFilterParams = {}) => {
	return useQuery({
		queryKey: [
			'production',
			'material-checklist',
			filters.work_order_id ?? '',
			filters.status ?? '',
			filters.product_id ?? '',
			filters.material_id ?? '',
		],
		queryFn: () => materialChecklistService.fetchMaterialChecklist(filters),
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: 1,
	});
};
