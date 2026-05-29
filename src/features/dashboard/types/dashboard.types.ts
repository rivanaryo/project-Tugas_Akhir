export interface GrossRevenueKPI {
  value: number;
  growth: number;
}

export interface CashInBankKPI {
  value: number;
  accounts: number;
}

export interface PendingPayablesKPI {
  value: number;
  due_this_week: number;
}

export interface CollectionRateKPI {
  value: number;
}

export interface KPI {
  gross_revenue: GrossRevenueKPI;
  cash_in_bank: CashInBankKPI;
  pending_payables: PendingPayablesKPI;
  collection_rate: CollectionRateKPI;
}

export interface PipelineItem {
  id?: string;
  invoice_number: string;
  customer: string;
  module: 'Sales' | 'Purchase' | 'Banking' | 'Masterdata';
  status: 'paid' | 'pending' | 'overdue' | 'unpaid' | 'approved' | 'cancelled';
  due_date: string;
  amount: number;
  type: 'incoming' | 'outgoing';
}

export interface LaravelPaginationMeta {
  current_page: number;
  data: PipelineItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    kpi: KPI;
    pipeline: LaravelPaginationMeta;
  };
}

export type RevenueRow = {
  id: string;
  invoice: string;
  customer: string;
  module: 'Sales' | 'Purchase' | 'Banking' | 'Masterdata';
  status: 'Paid' | 'Pending' | 'Overdue';
  amount: number;
  dueDate: string;
};
