import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sizeChartService } from '../services/sizeChartService';
import type { CreateSizeChartInput } from '../schemas/sizeChart.schema';

export const useCreateSizeChart = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateSizeChartInput) => sizeChartService.createSizeChart(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['masterdata', 'size-charts'] });
		},
	});
};
