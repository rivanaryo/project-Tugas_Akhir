import api from '../../../../lib/api';
import type { SampleApproval, SampleApprovalFilterParams } from '../types/sampleApproval.types';
import {
	createSampleApprovalInputSchema,
	parseSampleApprovalResponse,
	parseSampleApprovalsResponse,
	updateSampleApprovalInputSchema,
	updateSampleApprovalStatusInputSchema,
	type CreateSampleApprovalInput,
	type UpdateSampleApprovalInput,
	type UpdateSampleApprovalStatusInput,
} from '../schemas/sampleApproval.schema';

const cleanParams = (params: Record<string, unknown>) => {
	const cleaned: Record<string, unknown> = {};

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null) return;
		if (typeof value === 'string' && value.trim() === '') return;
		cleaned[key] = value;
	});

	return cleaned;
};

export const sampleApprovalService = {
	fetchSampleApprovals: async (filters: SampleApprovalFilterParams = {}): Promise<SampleApproval[]> => {
		const response = await api.get('/rd/sample-approvals', {
			params: cleanParams({
				status: filters.status,
				product_id: filters.product_id,
				customer_id: filters.customer_id,
				q: filters.q,
			}),
		});

		return parseSampleApprovalsResponse(response.data);
	},

	createSampleApproval: async (payload: CreateSampleApprovalInput): Promise<SampleApproval> => {
		const validated = createSampleApprovalInputSchema.parse(payload);
		const response = await api.post('/rd/sample-approvals', validated);
		return parseSampleApprovalResponse(response.data);
	},

	updateSampleApproval: async (id: string, payload: UpdateSampleApprovalInput): Promise<SampleApproval> => {
		const validated = updateSampleApprovalInputSchema.parse(payload);
		const response = await api.put(`/rd/sample-approvals/${id}`, validated);
		return parseSampleApprovalResponse(response.data);
	},

	updateSampleApprovalStatus: async (
		id: string,
		payload: UpdateSampleApprovalStatusInput
	): Promise<SampleApproval> => {
		const validated = updateSampleApprovalStatusInputSchema.parse(payload);
		const response = await api.patch(`/rd/sample-approvals/${id}/status`, validated);
		return parseSampleApprovalResponse(response.data);
	},

	deleteSampleApproval: async (id: string): Promise<{ message: string }> => {
		const response = await api.delete(`/rd/sample-approvals/${id}`);
		const responseBody = response.data as { message?: string };
		return { message: responseBody?.message ?? 'Sample approval berhasil dihapus' };
	},
};
