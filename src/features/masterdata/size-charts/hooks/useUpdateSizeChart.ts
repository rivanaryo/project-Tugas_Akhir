import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sizeChartService } from '../services/sizeChartService';
import type { UpdateSizeChartInput } from '../schemas/sizeChart.schema';

export const useUpdateSizeChart = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateSizeChartInput }) =>
			sizeChartService.updateSizeChart(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['masterdata', 'size-charts'] });
		},
	});
};
