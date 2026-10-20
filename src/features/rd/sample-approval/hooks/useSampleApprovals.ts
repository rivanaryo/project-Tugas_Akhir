import { useQuery } from '@tanstack/react-query';
import { sampleApprovalService } from '../services/sampleApprovalService';
import type { SampleApprovalFilterParams } from '../types/sampleApproval.types';

export const useSampleApprovals = (filters: SampleApprovalFilterParams = {}) => {
	return useQuery({
		queryKey: [
			'rd',
			'sample-approvals',
			filters.status ?? '',
			filters.product_id ?? '',
			filters.customer_id ?? '',
			filters.q ?? '',
		],
		queryFn: () => sampleApprovalService.fetchSampleApprovals(filters),
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: 1,
	});
};
