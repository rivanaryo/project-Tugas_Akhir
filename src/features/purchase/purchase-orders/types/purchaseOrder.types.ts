export type PurchaseOrderStatus = 'pending' | 'partially_received' | 'completed';

export interface PurchaseOrderFilterParams {
  q?: string;
  status?: PurchaseOrderStatus;
  vendor_id?: string;
  po_date_from?: string;
  po_date_to?: string;
}

export interface PurchaseOrderVendorRef {
  id: string | number;
  vendor_name: string;
}

export interface PurchaseOrderHead {
  id: string | number;
  po_number: string;
  vendor_id: string | number;
  status: PurchaseOrderStatus;
  po_date: string;
  actions: string;
  total_price?: string | number | null;
  vendor?: PurchaseOrderVendorRef | null;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderItem {
  id?: string | number;
  purchase_order_id: string | number;
  pricelist_id?: string | number | null;
  product_id: string | number;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  tax_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderCreateResult {
  purchase_order_id: string | number;
}

export interface PurchaseOrderItemProductRef {
  id: string | number;
  product_name: string;
}

export interface PurchaseOrderItemPricelistRef {
  id: string | number;
  price: string | number;
  currency: string;
  vendor?: PurchaseOrderVendorRef | null;
  product?: PurchaseOrderItemProductRef | null;
}

export interface PurchaseOrderItemDetail {
  id: string | number;
  purchase_order_id: string | number;
  product_id: string | number;
  quantity: number;
  unit_price: string | number;
  tax_rate?: string | number;
  tax_amount?: string | number;
  total_price?: string | number | null;
  pricelist_id?: string | number | null;
  purchase_order?: PurchaseOrderHead | null;
  pricelist?: PurchaseOrderItemPricelistRef | null;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrdersPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedPurchaseOrders {
  items: PurchaseOrderHead[];
  meta: PurchaseOrdersPaginationMeta;
}

export interface PurchaseOrderItemsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedPurchaseOrderItems {
  items: PurchaseOrderItemDetail[];
  meta: PurchaseOrderItemsPaginationMeta;
}
