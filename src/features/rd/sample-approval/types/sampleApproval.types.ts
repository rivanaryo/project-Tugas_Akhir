export type SampleApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision';

export interface SampleApprovalProductRef {
	id: string;
	product_name: string;
}

export interface SampleApprovalCustomerRef {
	id: string;
	customer_name: string;
}

export interface SampleApprovalSalesOrderRef {
	id: string;
	order_number: string;
}

export interface SampleApproval {
	id: string;
	sample_code: string;
	product_id: string;
	product?: SampleApprovalProductRef | null;
	customer_id: string;
	customer?: SampleApprovalCustomerRef | null;
	sales_order_id?: string | null;
	sales_order?: SampleApprovalSalesOrderRef | null;
	submitted_date: string;
	status: SampleApprovalStatus;
	notes: string;
	revision_count: number;
	created_at?: string;
	updated_at?: string;
}

export interface SampleApprovalFilterParams {
	status?: SampleApprovalStatus;
	product_id?: string;
	customer_id?: string;
	q?: string;
}
