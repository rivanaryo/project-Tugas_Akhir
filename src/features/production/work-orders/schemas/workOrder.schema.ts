import { z } from 'zod';
import type { PaginatedWorkOrders, WorkOrder } from '../types/workOrder.types';

export const workOrderStageSchema = z.enum(['cutting', 'printing', 'sewing', 'qc', 'ready']);
export const workOrderStatusSchema = z.enum(['draft', 'in-progress', 'completed', 'cancelled']);
export const workOrderPrioritySchema = z.enum(['low', 'medium', 'high']);

export const createWorkOrderInputSchema = z.object({
	wo_number: z.string().trim().min(1, 'Nomor SPK wajib diisi').max(50, 'Nomor SPK maksimal 50 karakter'),
	sales_order_id: z.string().trim().min(1, 'Sales Order wajib dipilih'),
	product_id: z.string().trim().min(1, 'Produk wajib dipilih'),
	tech_pack_id: z.string().trim().nullable().optional(),
	quantity: z.number().int().min(1, 'Quantity minimal 1'),
	stage: workOrderStageSchema,
	status: workOrderStatusSchema,
	priority: workOrderPrioritySchema.default('medium'),
	start_date: z.string().trim().min(1, 'Tanggal mulai wajib diisi'),
	due_date: z.string().trim().min(1, 'Tanggal selesai wajib diisi'),
});

export const updateWorkOrderInputSchema = createWorkOrderInputSchema.partial();

export const updateWorkOrderStageInputSchema = z.object({
	stage: workOrderStageSchema,
});

const customerRefSchema = z.object({
	id: z.string(),
	customer_name: z.string(),
});

const salesOrderRefSchema = z.object({
	id: z.string(),
	order_number: z.string(),
	customer: customerRefSchema.nullable().optional(),
});

const productRefSchema = z.object({
	id: z.string(),
	product_name: z.string(),
});

const techPackRefSchema = z.object({
	id: z.string(),
	name: z.string(),
});

const workOrderSchema = z.object({
	id: z.string(),
	wo_number: z.string(),
	sales_order_id: z.string(),
	sales_order: salesOrderRefSchema.nullable().optional(),
	product_id: z.string(),
	product: productRefSchema.nullable().optional(),
	tech_pack_id: z.string().nullable().optional(),
	tech_pack: techPackRefSchema.nullable().optional(),
	quantity: z.number().int(),
	stage: workOrderStageSchema,
	status: workOrderStatusSchema,
	priority: workOrderPrioritySchema,
	start_date: z.string(),
	due_date: z.string(),
	progress: z.number().int().min(0).max(100),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

const workOrdersArraySchema = z.array(workOrderSchema);

const paginationSchema = z.object({
	current_page: z.number(),
	per_page: z.number().default(15),
	last_page: z.number().default(1),
	total: z.number(),
	from: z.number().nullable().optional(),
	to: z.number().nullable().optional(),
	next_page_url: z.string().nullable().optional(),
	prev_page_url: z.string().nullable().optional(),
	data: workOrdersArraySchema,
});

const paginatedResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: paginationSchema,
});

const emptyMeta = (perPage = 15) => ({
	currentPage: 1,
	lastPage: 1,
	perPage,
	total: 0,
	from: 0,
	to: 0,
	hasNextPage: false,
	hasPrevPage: false,
});

export const parseWorkOrdersResponse = (payload: unknown, perPageFallback = 15): PaginatedWorkOrders => {
	const parsed = paginatedResponseSchema.safeParse(payload);

	if (!parsed.success) {
		return {
			items: [],
			meta: emptyMeta(perPageFallback),
		};
	}

	const pagination = parsed.data.data;
	const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
	const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

	return {
		items: pagination.data as WorkOrder[],
		meta: {
			currentPage: pagination.current_page,
			lastPage: pagination.last_page,
			perPage: pagination.per_page,
			total: pagination.total,
			from,
			to,
			hasNextPage: Boolean(pagination.next_page_url),
			hasPrevPage: Boolean(pagination.prev_page_url),
		},
	};
};

const workOrderResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: workOrderSchema,
});

export const parseWorkOrderResponse = (payload: unknown): WorkOrder => {
	const wrapped = workOrderResponseSchema.safeParse(payload);
	if (wrapped.success) return wrapped.data.data as WorkOrder;

	const raw = workOrderSchema.safeParse(payload);
	if (raw.success) return raw.data as WorkOrder;

	throw new Error('Failed to parse work order response');
};

const createWorkOrderResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: workOrderSchema,
});

export const parseCreateWorkOrderResponse = (payload: unknown): WorkOrder => {
	const parsed = createWorkOrderResponseSchema.safeParse(payload);
	if (!parsed.success) throw new Error('Failed to parse create work order response');
	return parsed.data.data as WorkOrder;
};

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderInputSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderInputSchema>;
export type UpdateWorkOrderStageInput = z.infer<typeof updateWorkOrderStageInputSchema>;
