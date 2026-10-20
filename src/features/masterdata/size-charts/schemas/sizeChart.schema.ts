import { z } from 'zod';
import type { PaginatedSizeCharts, SizeChart } from '../types/sizeChart.types';

const sizeSchema = z.enum(['S', 'M', 'L', 'XL', 'XXL']);

export const optionalNumber = z.union([z.literal(''), z.coerce.number().min(0)]).optional();

const nullableNumber = z.coerce.number().min(0).nullable().optional();

const sizeChartSchema = z.object({
	id: z.string(),
	product_id: z.string(),
	product: z
		.object({
			id: z.string(),
			product_name: z.string(),
		})
		.nullable()
		.optional(),
	tech_pack_id: z.string().nullable().optional(),
	tech_pack: z.unknown().nullable().optional(),
	size: sizeSchema,
	chest_width: nullableNumber,
	body_length: nullableNumber,
	sleeve_length: nullableNumber,
	shoulder_width: nullableNumber,
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const sizeChartsArraySchema = z.array(sizeChartSchema);

export const createSizeChartInputSchema = z.object({
	product_id: z.string().min(1, 'Produk wajib dipilih'),
	tech_pack_id: z.string().optional(),
	size: sizeSchema,
	chest_width: optionalNumber,
	body_length: optionalNumber,
	sleeve_length: optionalNumber,
	shoulder_width: optionalNumber,
});

export const updateSizeChartInputSchema = createSizeChartInputSchema.partial().extend({
	product_id: z.string().min(1, 'Produk wajib dipilih'),
	size: sizeSchema,
});

const sizeChartsPaginationSchema = z.object({
	current_page: z.number(),
	data: sizeChartsArraySchema,
	per_page: z.number().default(15),
	total: z.number(),
	last_page: z.number().default(1),
	from: z.number().nullable().optional(),
	to: z.number().nullable().optional(),
	next_page_url: z.string().nullable().optional(),
	prev_page_url: z.string().nullable().optional(),
});

const paginatedResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: sizeChartsPaginationSchema,
});

const singleResponseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: sizeChartSchema,
});

export type SizeChartSchema = z.infer<typeof sizeChartSchema>;
export type CreateSizeChartInput = z.infer<typeof createSizeChartInputSchema>;
export type UpdateSizeChartInput = z.infer<typeof updateSizeChartInputSchema>;

export const parseSizeChartsResponse = (payload: unknown): PaginatedSizeCharts => {
	const parsed = paginatedResponseSchema.safeParse(payload);

	if (!parsed.success) {
		return {
			items: [],
			meta: {
				currentPage: 1,
				lastPage: 1,
				perPage: 15,
				total: 0,
				from: 0,
				to: 0,
				hasNextPage: false,
				hasPrevPage: false,
			},
		};
	}

	const pagination = parsed.data.data;
	const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
	const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

	return {
		items: pagination.data as SizeChart[],
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

export const parseSingleSizeChartResponse = (payload: unknown): SizeChart => {
	const parsed = singleResponseSchema.safeParse(payload);

	if (!parsed.success) {
		throw new Error('Failed to parse size chart response');
	}

	return parsed.data.data as SizeChart;
};

export const parseCreateSizeChartResponse = parseSingleSizeChartResponse;
export const parseUpdateSizeChartResponse = parseSingleSizeChartResponse;
