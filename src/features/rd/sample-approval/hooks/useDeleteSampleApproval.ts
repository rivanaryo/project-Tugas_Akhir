import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sampleApprovalService } from '../services/sampleApprovalService';

export const useDeleteSampleApproval = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sampleApprovalService.deleteSampleApproval(id),
		onSuccess: (result) => {
			toast.success(result.message);
			queryClient.invalidateQueries({ queryKey: ['rd', 'sample-approvals'] });
		},
		onError: () => {
			toast.error('Gagal menghapus sample approval');
		},
	});
};
