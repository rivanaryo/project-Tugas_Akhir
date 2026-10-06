import api from '../../../lib/api';
import type { DashboardResponse, RevenueRow, PipelineItem } from '../types/dashboard.types';

export interface DashboardQueryParams {
  page?: number;
  per_page?: number;
}

export const dashboardService = {
  fetchDashboardData: async (params?: DashboardQueryParams): Promise<DashboardResponse> => {
    const response = await api.get('/dashboard', {
      params: {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 10,
      },
    });
    return response.data as DashboardResponse;
  },
};

export const mapPipelineToRevenueRows = (pipeline: PipelineItem[] | undefined, pageOffset = 0): RevenueRow[] => {
  if (!pipeline || !Array.isArray(pipeline)) {
    return [];
  }
  return pipeline.map((item, index) => ({
    id: item.id ?? `${pageOffset + index + 1}`,
    invoice: item.invoice_number,
    customer: item.customer,
    module: item.module,
    status: item.status.charAt(0).toUpperCase() + item.status.slice(1) as 'Paid' | 'Pending' | 'Overdue',
    amount: item.amount,
    dueDate: item.due_date,
  }));
};
