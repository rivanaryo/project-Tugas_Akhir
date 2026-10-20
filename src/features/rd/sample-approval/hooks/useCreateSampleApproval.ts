import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sampleApprovalService } from '../services/sampleApprovalService';
import type { CreateSampleApprovalInput } from '../schemas/sampleApproval.schema';

export const useCreateSampleApproval = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateSampleApprovalInput) => sampleApprovalService.createSampleApproval(payload),
		onSuccess: () => {
			toast.success('Sample approval berhasil dibuat');
			queryClient.invalidateQueries({ queryKey: ['rd', 'sample-approvals'] });
		},
		onError: () => {
			toast.error('Gagal membuat sample approval');
		},
	});
};
