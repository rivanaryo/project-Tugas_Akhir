import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sampleApprovalService } from '../services/sampleApprovalService';
import type { UpdateSampleApprovalInput } from '../schemas/sampleApproval.schema';

export const useUpdateSampleApproval = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateSampleApprovalInput }) =>
			sampleApprovalService.updateSampleApproval(id, payload),
		onSuccess: (_data, variables) => {
			toast.success('Sample approval berhasil diperbarui');
			queryClient.invalidateQueries({ queryKey: ['rd', 'sample-approvals'] });
			queryClient.invalidateQueries({ queryKey: ['rd', 'sample-approvals', variables.id] });
		},
		onError: () => {
			toast.error('Gagal memperbarui sample approval');
		},
	});
};
