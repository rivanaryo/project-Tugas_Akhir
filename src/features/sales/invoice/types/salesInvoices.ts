
// Status mapping untuk database: 0=pending, 1=paid/approved, 2=cancelled
export const SALES_INVOICE_STATUS_MAP = {
  pending: 0,
  approved: 1,
  paid: 1,
  completed: 1,
  cancelled: 2,
} as const;

// Reverse mapping untuk display
export const SALES_INVOICE_STATUS_LABEL: Record<number, string> = {
  0: 'Pending',
  1: 'Approved',
  2: 'Cancelled',
};

export type SalesInvoiceStatus = boolean | 'pending' | 'approved' | 'completed' | 'cancelled' | 'paid';

export interface SalesInvoiceFilterParams {
  q?: string;
  status?: SalesInvoiceStatus;
  customer_id?: string;
  invoice_date_from?: string;
  invoice_date_to?: string;
}

export interface SalesInvoiceCustomerRef {
  id: string | number;
  customer_name: string;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface SalesInvoiceHead {
  id: string | number;
  invoice_number: string;
  type?: 'dp' | 'pelunasan';
  invoice_date: string;
  due_date?: string | null;
  customer_id: string | number;
  sales_order_id?: string | number | null;
  subtotal: string | number | null;
  tax_total: string | number | null;
  grand_total: string | number | null;
  status: SalesInvoiceStatus;
  customer?: SalesInvoiceCustomerRef | null;
  items?: SalesInvoiceItemDetail[];
}

export interface SalesInvoiceCreateResult {
  sales_invoice_id: string | number;
}

export interface SalesInvoiceItemDetail {
  id: string | number;
  invoice_id: string | number;
  sales_order_item_id: string | number;
  qty_invoice: number;
  unit_price: string | number | null;
  subtotal: string | number | null;
  tax_rate: string | number | null;
  tax_amount: string | number | null;
  total_price: string | number | null;
  sales_order_item?: {
    product?: {
      product_name: string;
    } | null;
  } | null;
}

export interface SalesInvoicePaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalesInvoices {
  items: SalesInvoiceHead[];
  meta: SalesInvoicePaginationMeta;
}

export interface SalesInvoiceItemsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalesInvoiceItems {
  items: SalesInvoiceItemDetail[];
  meta: SalesInvoiceItemsPaginationMeta;
}
