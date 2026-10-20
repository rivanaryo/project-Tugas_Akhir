import api from '../../../../lib/api';
import type { MaterialChecklistFilterParams, MaterialChecklistItem } from '../types/materialChecklist.types';
import { parseMaterialChecklistResponse } from '../schemas/materialChecklist.schema';

const cleanParams = (params: Record<string, unknown>) => {
	const cleaned: Record<string, unknown> = {};

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return;
		if (typeof value === 'string' && value.trim() === '') return;
		cleaned[key] = value;
	});

	return cleaned;
};

export const materialChecklistService = {
	fetchMaterialChecklist: async (
		filters: MaterialChecklistFilterParams = {}
	): Promise<MaterialChecklistItem[]> => {
		const response = await api.get('/production/material-checklist', {
			params: cleanParams({
				work_order_id: filters.work_order_id,
				status: filters.status,
				product_id: filters.product_id,
				material_id: filters.material_id,
			}),
		});

		return parseMaterialChecklistResponse(response.data);
	},
};
