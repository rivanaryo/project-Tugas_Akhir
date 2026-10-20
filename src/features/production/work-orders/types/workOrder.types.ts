export type WorkOrderStage = 'cutting' | 'printing' | 'sewing' | 'qc' | 'ready';
export type WorkOrderStatus = 'draft' | 'in-progress' | 'completed' | 'cancelled';
export type WorkOrderPriority = 'low' | 'medium' | 'high';

export interface WorkOrderCustomerRef {
	id: string;
	customer_name: string;
}

export interface WorkOrderSalesOrderRef {
	id: string;
	order_number: string;
	customer?: WorkOrderCustomerRef | null;
}

export interface WorkOrderProductRef {
	id: string;
	product_name: string;
}

export interface WorkOrderTechPackRef {
	id: string;
	name: string;
}

export interface WorkOrder {
	id: string;
	wo_number: string;
	sales_order_id: string;
	sales_order?: WorkOrderSalesOrderRef | null;
	product_id: string;
	product?: WorkOrderProductRef | null;
	tech_pack_id?: string | null;
	tech_pack?: WorkOrderTechPackRef | null;
	quantity: number;
	stage: WorkOrderStage;
	status: WorkOrderStatus;
	priority: WorkOrderPriority;
	start_date: string;
	due_date: string;
	progress: number;
	created_at?: string;
	updated_at?: string;
}

export interface WorkOrderFilterParams {
	q?: string;
	status?: WorkOrderStatus;
	stage?: string;
	sales_order_id?: string;
	product_id?: string;
	date_from?: string;
	date_to?: string;
}

export interface WorkOrdersPaginationMeta {
	currentPage: number;
	lastPage: number;
	perPage: number;
	total: number;
	from: number;
	to: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedWorkOrders {
	items: WorkOrder[];
	meta: WorkOrdersPaginationMeta;
}
