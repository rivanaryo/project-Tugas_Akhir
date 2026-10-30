export type SalesOrderStatus = 'draft' | 'approved' | 'dp_paid' | 'in_production' | 'delivered' | 'cancelled' | '0' | '1' | '2' | 'pending' | 'completed' | boolean;

export interface SalesOrderFilterParams {
  q?: string;
  status?: SalesOrderStatus;
  customer_id?: string;
  order_date_from?: string;
  order_date_to?: string;
}

export interface SalesOrderCustomerRef {
  id: string | number;
  customer_name: string;
}

export interface SalesOrderHead {
  id: string | number;
  order_number: string;
  sales_quotation_id?: string | number | null;
  customer_id: string | number;
  status: SalesOrderStatus;
  order_date: string;
  actions?: string;
  subtotal?: string | number | null;
  total_tax?: string | number | null;
  grand_total?: string | number | null;
  customer?: SalesOrderCustomerRef | null;
  items?: SalesOrderItemDetail[];
  created_at?: string;
  updated_at?: string;
}


export interface SalesOrderCreateResult {
  sales_order_id: string | number;
}

export interface SalesOrderItemProductRef {
  id: string | number;
  product_name: string;
}

export interface SalesOrderItemDetail {
  id?: string | number;
  sales_order_id?: string | number;
  product_id: string | number;
  size?: string | null;
  quantity: number;
  unit_price: string | number;
  product_name?: string;
  tax_rate?: string | number;
  tax_amount?: string | number;
  total_price?: string | number | null;
  created_at?: string;
  updated_at?: string;
  product?: SalesOrderItemProductRef | null;
}

export interface SalesOrdersPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalesOrders {
  items: SalesOrderHead[];
  meta: SalesOrdersPaginationMeta;
}

export interface SalesOrderItemsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalesOrderItems {
  items: SalesOrderItemDetail[];
  meta: SalesOrderItemsPaginationMeta;
}
