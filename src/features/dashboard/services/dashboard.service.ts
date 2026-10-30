import { z } from 'zod';
import api from '../../../lib/api';
import type { DashboardResponse, RevenueRow, PipelineItem } from '../types/dashboard.types';

export interface DashboardQueryParams {
  page?: number;
  per_page?: number;
  active_work_orders_limit?: number;
}

const money = z.union([
  z.number(),
  z.string().trim().regex(/^-?\d+(\.\d+)?$/, 'Nominal harus berupa angka').transform(Number),
]).pipe(z.number().finite());
const count = z.number().int().nonnegative();
const growthKPI = z.object({ value: money, growth: money });
export const dashboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    kpi: z.object({
      revenue_month: growthKPI,
      active_po: z.object({ value: count, breakdown: z.object({ draft: count, approved: count, received: count, cancelled: count }) }),
      material_expense: growthKPI,
      unpaid_invoices: z.object({ value: money, count }),
      gross_revenue: growthKPI,
      cash_in_bank: z.object({ value: money, accounts: count }),
      pending_payables: z.object({ value: money, due_this_week: count }),
      collection_rate: z.object({ value: money }),
    }),
    pipeline_summary: z.object({ paid_amount: money, pending_amount: money, overdue_amount: money, paid_count: count, pending_count: count, overdue_count: count }),
    pipeline: z.object({
      current_page: z.number().int().min(1), per_page: z.number().int().min(1), last_page: z.number().int().min(1), total: count,
      from: count.nullable().optional(), to: count.nullable().optional(),
      next_page_url: z.string().nullable().optional(), prev_page_url: z.string().nullable().optional(),
      data: z.array(z.object({
        id: z.string(), invoice_number: z.string(), customer: z.string(), module: z.literal('Sales'),
        status: z.enum(['paid', 'pending', 'overdue']), due_date: z.iso.date().nullable(), invoice_date: z.iso.date(),
        amount: money, type: z.literal('incoming'), invoice_type: z.enum(['DP', 'Pelunasan']),
        paid_amount: money, outstanding_amount: money,
      })),
    }),
    active_work_orders: z.array(z.object({
      id: z.string(), work_order_number: z.string(), product_name: z.string(), stage: z.string(),
      progress: z.number().min(0).max(100), status: z.string(),
    })),
    active_work_orders_total: count,
  }),
});

export const dashboardService = {
  fetchDashboardData: async (params?: DashboardQueryParams): Promise<DashboardResponse> => {
    const response = await api.get('/dashboard', {
      params: { page: params?.page ?? 1, per_page: params?.per_page ?? 10, active_work_orders_limit: params?.active_work_orders_limit ?? 4 },
    });
    return dashboardResponseSchema.parse(response.data);
  },
};

export const mapPipelineToRevenueRows = (pipeline: PipelineItem[] | undefined, pageOffset = 0): RevenueRow[] =>
  (pipeline ?? []).map((item, index) => ({
    id: `${item.id}-${pageOffset + index}`,
    invoice: item.invoice_number,
    customer: item.customer,
    invoiceType: item.invoice_type,
    status: ({ paid: 'Paid', pending: 'Pending', overdue: 'Overdue' } as const)[item.status],
    amount: item.amount,
    paidAmount: item.paid_amount,
    outstandingAmount: item.outstanding_amount,
    dueDate: item.due_date,
  }));
