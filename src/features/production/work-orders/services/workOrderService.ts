import api from '../../../../lib/api';
import type { PaginatedWorkOrders, WorkOrder, WorkOrderFilterParams } from '../types/workOrder.types';
import {
	createWorkOrderInputSchema,
	parseCreateWorkOrderResponse,
	parseWorkOrderResponse,
	parseWorkOrdersResponse,
	updateWorkOrderInputSchema,
	updateWorkOrderStageInputSchema,
	type CreateWorkOrderInput,
	type UpdateWorkOrderInput,
	type UpdateWorkOrderStageInput,
} from '../schemas/workOrder.schema';

const cleanParams = (params: Record<string, unknown>) => {
	const cleaned: Record<string, unknown> = {};

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return;
		if (typeof value === 'string' && value.trim() === '') return;
		cleaned[key] = value;
	});

	return cleaned;
};

export const workOrderService = {
	fetchWorkOrders: async (
		page: number,
		perPage = 15,
		filters: WorkOrderFilterParams = {}
	): Promise<PaginatedWorkOrders> => {
		const response = await api.get('/production/work-orders', {
			params: cleanParams({
				page,
				per_page: perPage,
				q: filters.q,
				status: filters.status,
				stage: filters.stage,
				sales_order_id: filters.sales_order_id,
				product_id: filters.product_id,
				date_from: filters.date_from,
				date_to: filters.date_to,
			}),
		});

		return parseWorkOrdersResponse(response.data, perPage);
	},

	fetchWorkOrder: async (id: string): Promise<WorkOrder> => {
		const response = await api.get(`/production/work-orders/${id}`);
		return parseWorkOrderResponse(response.data);
	},

	createWorkOrder: async (payload: CreateWorkOrderInput): Promise<WorkOrder> => {
		const validated = createWorkOrderInputSchema.parse(payload);
		const response = await api.post('/production/work-orders', validated);
		return parseCreateWorkOrderResponse(response.data);
	},

	updateWorkOrder: async (id: string, payload: UpdateWorkOrderInput): Promise<WorkOrder> => {
		const validated = updateWorkOrderInputSchema.parse(payload);
		const response = await api.put(`/production/work-orders/${id}`, validated);
		return parseWorkOrderResponse(response.data);
	},

	updateWorkOrderStage: async (id: string, payload: UpdateWorkOrderStageInput): Promise<WorkOrder> => {
		const validated = updateWorkOrderStageInputSchema.parse(payload);
		const response = await api.patch(`/production/work-orders/${id}/stage`, validated);
		return parseWorkOrderResponse(response.data);
	},

	deleteWorkOrder: async (id: string): Promise<{ message: string }> => {
		const response = await api.delete(`/production/work-orders/${id}`);
		const responseBody = response.data as { message?: string };
		return { message: responseBody?.message ?? 'Work order berhasil dihapus' };
	},
};
