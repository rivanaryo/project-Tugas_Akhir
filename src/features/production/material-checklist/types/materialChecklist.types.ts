export type MaterialChecklistStatus = 'sufficient' | 'shortage' | 'pending';

export interface MaterialChecklistWorkOrderRef {
	id: string;
	wo_number: string;
}

export interface MaterialChecklistProductRef {
	id: string;
	product_name: string;
}

export interface MaterialChecklistItem {
	id: string;
	work_order: MaterialChecklistWorkOrderRef;
	product: MaterialChecklistProductRef;
	material_id: string;
	material: string;
	required: number;
	purchased: number;
	unit: string;
	status: MaterialChecklistStatus;
}

export interface MaterialChecklistFilterParams {
	work_order_id?: string;
	status?: MaterialChecklistStatus;
	product_id?: string;
	material_id?: string;
}
