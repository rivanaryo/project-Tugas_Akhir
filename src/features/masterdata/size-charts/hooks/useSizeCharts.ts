import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import { sizeChartService } from '../services/sizeChartService';

interface UseSizeChartsParams {
	page: number;
	perPage?: number;
	filters?: MasterdataListFilterParams;
}

export const useSizeCharts = ({ page, perPage = 15, filters = {} }: UseSizeChartsParams) => {
	return useQuery({
		queryKey: ['masterdata', 'size-charts', page, perPage, filters],
		queryFn: () => sizeChartService.fetchSizeCharts(page, perPage, filters),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: 1,
	});
};
