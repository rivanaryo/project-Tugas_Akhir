import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sizeChartService } from '../services/sizeChartService';

export const useDeleteSizeChart = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sizeChartService.deleteSizeChart(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['masterdata', 'size-charts'] });
		},
	});
};
