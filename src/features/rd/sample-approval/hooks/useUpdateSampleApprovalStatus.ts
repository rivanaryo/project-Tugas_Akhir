import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sampleApprovalService } from '../services/sampleApprovalService';
import type { UpdateSampleApprovalStatusInput } from '../schemas/sampleApproval.schema';

export const useUpdateSampleApprovalStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateSampleApprovalStatusInput }) =>
			sampleApprovalService.updateSampleApprovalStatus(id, payload),
		onSuccess: () => {
			toast.success('Status sample approval berhasil diperbarui');
			queryClient.invalidateQueries({ queryKey: ['rd', 'sample-approvals'] });
		},
		onError: () => {
			toast.error('Gagal memperbarui status sample approval');
		},
	});
};
