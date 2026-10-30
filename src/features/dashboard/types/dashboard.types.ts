export interface GrowthKPI {
  value: number;
  growth: number;
}

export interface KPI {
  revenue_month: GrowthKPI;
  active_po: {
    value: number;
    breakdown: { draft: number; approved: number; received: number; cancelled: number };
  };
  material_expense: GrowthKPI;
  unpaid_invoices: { value: number; count: number };
  gross_revenue: GrowthKPI;
  cash_in_bank: { value: number; accounts: number };
  pending_payables: { value: number; due_this_week: number };
  collection_rate: { value: number };
}

export interface PipelineItem {
  id: string;
  invoice_number: string;
  customer: string;
  module: 'Sales';
  status: 'paid' | 'pending' | 'overdue';
  due_date: string | null;
  invoice_date: string;
  amount: number;
  type: 'incoming';
  invoice_type: 'DP' | 'Pelunasan';
  paid_amount: number;
  outstanding_amount: number;
}

export interface PipelinePagination {
  current_page: number;
  data: PipelineItem[];
  per_page: number;
  last_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

export interface PipelineSummary {
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface ActiveWorkOrder {
  id: string;
  work_order_number: string;
  product_name: string;
  stage: string;
  progress: number;
  status: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    kpi: KPI;
    pipeline_summary: PipelineSummary;
    pipeline: PipelinePagination;
    active_work_orders: ActiveWorkOrder[];
    active_work_orders_total: number;
  };
}

export interface RevenueRow {
  id: string;
  invoice: string;
  customer: string;
  invoiceType: PipelineItem['invoice_type'];
  status: 'Paid' | 'Pending' | 'Overdue';
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string | null;
}
