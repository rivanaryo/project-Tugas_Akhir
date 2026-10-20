import { z } from 'zod';
import type { SampleApproval } from '../types/sampleApproval.types';

export const sampleApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'revision']);

export const createSampleApprovalInputSchema = z.object({
	sample_code: z.string().trim().min(1, 'Kode sample wajib diisi').max(50, 'Kode sample maksimal 50 karakter'),
	product_id: z.string().trim().min(1, 'Produk wajib dipilih'),
	customer_id: z.string().trim().min(1, 'Customer wajib dipilih'),
	sales_order_id: z.string().trim().nullable().optional(),
	submitted_date: z.string().trim().min(1, 'Tanggal submit wajib diisi'),
	status: sampleApprovalStatusSchema,
	notes: z.string().nullable().optional(),
	revision_count: z.number().int().min(0).default(0),
});

export const updateSampleApprovalInputSchema = createSampleApprovalInputSchema.partial();

export const updateSampleApprovalStatusInputSchema = z.object({
	status: z.enum(['approved', 'rejected', 'revision']),
	notes: z.string().nullable().optional(),
});

const productRefSchema = z.object({
	id: z.string(),
	product_name: z.string(),
});

const customerRefSchema = z.object({
	id: z.string(),
	customer_name: z.string(),
});

const salesOrderRefSchema = z.object({
	id: z.string(),
	order_number: z.string(),
});

const sampleApprovalSchema = z.object({
	id: z.string(),
	sample_code: z.string(),
	product_id: z.string(),
	product: productRefSchema.nullable().optional(),
	customer_id: z.string(),
	customer: customerRefSchema.nullable().optional(),
	sales_order_id: z.string().nullable().optional(),
	sales_order: salesOrderRefSchema.nullable().optional(),
	submitted_date: z.string(),
	status: sampleApprovalStatusSchema,
	notes: z.string().nullable().optional(),
	revision_count: z.number().int().min(0).default(0),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

const sampleApprovalsArraySchema = z.array(sampleApprovalSchema);

const listResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: sampleApprovalsArraySchema,
});

export const parseSampleApprovalsResponse = (payload: unknown): SampleApproval[] => {
	const parsed = listResponseSchema.safeParse(payload);
	if (parsed.success) return parsed.data.data as SampleApproval[];

	const raw = sampleApprovalsArraySchema.safeParse(payload);
	if (raw.success) return raw.data as SampleApproval[];

	return [];
};

const singleResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: sampleApprovalSchema,
});

export const parseSampleApprovalResponse = (payload: unknown): SampleApproval => {
	const wrapped = singleResponseSchema.safeParse(payload);
	if (wrapped.success) return wrapped.data.data as SampleApproval;

	const raw = sampleApprovalSchema.safeParse(payload);
	if (raw.success) return raw.data as SampleApproval;

	throw new Error('Failed to parse sample approval response');
};

export type CreateSampleApprovalInput = z.infer<typeof createSampleApprovalInputSchema>;
export type UpdateSampleApprovalInput = z.infer<typeof updateSampleApprovalInputSchema>;
export type UpdateSampleApprovalStatusInput = z.infer<typeof updateSampleApprovalStatusInputSchema>;
