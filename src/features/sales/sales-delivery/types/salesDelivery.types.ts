export type SalesDeliveryStatus = 'draft' | 'approved' | 'delivered' | 'cancelled' | '0' | '1' | '2' | 'pending' | 'completed' | boolean;

export interface SalesDeliveryFilterParams {
  q?: string;
  status?: SalesDeliveryStatus;
  customer_id?: string;
  product_id?: string | number;
  delivery_date_from?: string;
  delivery_date_to?: string;
}

export interface SalesDeliveryCustomerRef {
  id: string | number;
  customer_name: string;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface SalesOrderRef {
  id: string | number;
  order_number: string;
  customer_id: string | number;
  order_date: string;
  status: boolean | string;
  subtotal?: string | number | null;
  total_tax?: string | number | null;
  grand_total?: string | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SalesDeliveryHead {
  id: string | number;
  delivery_number: string;
  customer_id: string | number;
  sales_order_id: string | number;
  delivery_date: string;
  status: SalesDeliveryStatus;
  customer?: SalesDeliveryCustomerRef | null;
  sales_order?: SalesOrderRef | null;
  items?: SalesDeliveryItemDetail[];
  created_at?: string;
  updated_at?: string;
}

export interface SalesDeliveryCreateResult {
  sales_delivery_id: string | number;
}

export interface SalesDeliveryItemDetail {
  id?: string | number;
  sales_delivery_id: string | number;
  sales_order_item_id: string | number;
  qty_delivered: number;
  created_at?: string;
  updated_at?: string;
  // Fields that might be needed but not in the specific JSON example
  product_id?: string | number;
  product_name?: string;
  tax_rate?: string | number;
  tax_amount?: string | number;
  total_price?: string | number | null;
  unit_price?: string | number;
  qty_so?: number;
  product?: {
    id: string | number;
    product_name: string;
  } | null;
  sales_order_item?: {
    id: string | number;
    product_id: string | number;
    quantity: number;
    unit_price?: string | number;
    product?: {
      id: string | number;
      product_name: string;
    } | null;
  } | null;
}

export interface SalesDeliveryPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalesDeliveries {
  items: SalesDeliveryHead[];
  meta: SalesDeliveryPaginationMeta;
}

export interface SalesDeliveryItemsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedSalesDeliveryItems {
  items: SalesDeliveryItemDetail[];
  meta: SalesDeliveryItemsPaginationMeta;
}
