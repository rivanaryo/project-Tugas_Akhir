import { z } from 'zod';
import type { MaterialChecklistItem } from '../types/materialChecklist.types';

export const materialChecklistStatusSchema = z.enum(['sufficient', 'shortage', 'pending']);

const workOrderRefSchema = z.object({
	id: z.string(),
	wo_number: z.string(),
});

const productRefSchema = z.object({
	id: z.string(),
	product_name: z.string(),
});

const materialChecklistItemSchema = z.object({
	id: z.string(),
	work_order: workOrderRefSchema,
	product: productRefSchema,
	material_id: z.string(),
	material: z.string(),
	required: z.number(),
	purchased: z.number(),
	unit: z.string(),
	status: materialChecklistStatusSchema,
});

const materialChecklistArraySchema = z.array(materialChecklistItemSchema);

const responseSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: materialChecklistArraySchema,
});

export const parseMaterialChecklistResponse = (payload: unknown): MaterialChecklistItem[] => {
	const parsed = responseSchema.safeParse(payload);
	if (parsed.success) return parsed.data.data as MaterialChecklistItem[];

	const raw = materialChecklistArraySchema.safeParse(payload);
	if (raw.success) return raw.data as MaterialChecklistItem[];

	return [];
};
