import api from '../../../../lib/api';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { PaginatedSizeCharts, SizeChart } from '../types/sizeChart.types';
import {
	createSizeChartInputSchema,
	parseCreateSizeChartResponse,
	parseSingleSizeChartResponse,
	parseSizeChartsResponse,
	parseUpdateSizeChartResponse,
	updateSizeChartInputSchema,
	type CreateSizeChartInput,
	type UpdateSizeChartInput,
} from '../schemas/sizeChart.schema';

const cleanParams = (params: Record<string, unknown>) => {
	const cleaned: Record<string, unknown> = {};

	Object.entries(params).forEach(([key, value]) => {
		if (value === null || value === undefined) {
			return;
		}

		if (typeof value === 'string' && value.trim() === '') {
			return;
		}

		cleaned[key] = value;
	});

	return cleaned;
};

const numberOrUndefined = (value: number | '' | undefined | null) => {
	if (value === '' || value === null || value === undefined) {
		return undefined;
	}
	return Number(value);
};

const toApiPayload = (values: CreateSizeChartInput | UpdateSizeChartInput) => ({
	product_id: values.product_id,
	tech_pack_id: values.tech_pack_id || undefined,
	size: values.size,
	chest_width: numberOrUndefined(values.chest_width),
	body_length: numberOrUndefined(values.body_length),
	sleeve_length: numberOrUndefined(values.sleeve_length),
	shoulder_width: numberOrUndefined(values.shoulder_width),
});

export const sizeChartService = {
	fetchSizeCharts: async (
		page: number,
		perPage = 15,
		filters: MasterdataListFilterParams = {}
	): Promise<PaginatedSizeCharts> => {
		const response = await api.get('/master-data/size-charts', {
			params: cleanParams({
				page,
				per_page: perPage,
				...filters,
			}),
		});

		return parseSizeChartsResponse(response.data);
	},

	getSizeChart: async (id: string): Promise<SizeChart> => {
		const response = await api.get(`/master-data/size-charts/${id}`);

		return parseSingleSizeChartResponse(response.data);
	},

	createSizeChart: async (payload: CreateSizeChartInput): Promise<SizeChart> => {
		const validatedPayload = createSizeChartInputSchema.parse(payload);
		const response = await api.post('/master-data/size-charts', toApiPayload(validatedPayload));

		return parseCreateSizeChartResponse(response.data);
	},

	updateSizeChart: async (id: string, payload: UpdateSizeChartInput): Promise<SizeChart> => {
		const validatedPayload = updateSizeChartInputSchema.parse(payload);
		const response = await api.put(`/master-data/size-charts/${id}`, toApiPayload(validatedPayload));

		return parseUpdateSizeChartResponse(response.data);
	},

	deleteSizeChart: async (id: string): Promise<{ message: string }> => {
		const response = await api.delete(`/master-data/size-charts/${id}`);
		const body = response.data as { message?: string; success?: boolean };

		return {
			message: body.message ?? 'Size chart berhasil dihapus',
		};
	},
};
