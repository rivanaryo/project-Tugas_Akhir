export type GoodReceiptStatus = 'draft' | 'approved' | 'received' | 'cancelled';

export interface GoodReceiptFilterParams {
  q?: string;
  status?: GoodReceiptStatus;
  vendor_id?: string;
  warehouse_id?: string;
  receipt_date_from?: string;
  receipt_date_to?: string;
}

export interface GoodReceiptVendorRef {
  id: string | number;
  vendor_name: string;
}

export interface GoodReceiptPurchaseOrderRef {
  id: string | number;
  po_number: string;
  vendor_id?: string | number;
  vendor?: GoodReceiptVendorRef | null;
}

export interface GoodReceiptWarehouseRef {
  id: string | number;
  code?: string;
  name?: string;
  location?: string;
}

export interface GoodReceiptHead {
  id: string | number;
  gr_number: string;
  purchase_order_id: string | number;
  vendor_id: string | number;
  warehouse_id?: string | number;
  receipt_date: string;
  status: GoodReceiptStatus;
  actions?: string;
  vendor?: GoodReceiptVendorRef | null;
  warehouse?: GoodReceiptWarehouseRef | null;
  purchase_order?: GoodReceiptPurchaseOrderRef | null;
  purchaseOrder?: GoodReceiptPurchaseOrderRef | null;
  items?: GoodReceiptItemDetail[];
  created_at?: string;
  updated_at?: string;
}

export interface GoodReceiptItem {
  id?: string | number;
  good_receipt_id: string | number;
  purchase_order_item_id: string | number;
  pricelist_id?: string | number | null;
  product_id?: string | number | null;
  qty_received: number;
  created_at?: string;
  updated_at?: string;
}

export interface GoodReceiptCreateResult {
  good_receipt_id: string | number;
}

export interface GoodReceiptItemUnitRef {
  unit_code?: string;
  unit_name?: string;
}

export interface GoodReceiptItemProductRef {
  id: string | number;
  product_name: string;
  unit?: GoodReceiptItemUnitRef | null;
}

export interface GoodReceiptItemPricelistRef {
  id: string | number;
  price: string | number;
  currency: string;
  vendor?: GoodReceiptVendorRef | null;
  product?: GoodReceiptItemProductRef | null;
  product_name?: string;
}

export interface GoodReceiptPurchaseOrderItemRef {
  id: string | number;
  purchase_order_id: string | number;
  product_id: string | number;
  quantity: number;
  unit_price: string | number;
  total_price?: string | number | null;
  pricelist_id?: string | number | null;
  product_name?: string;
  pricelist?: GoodReceiptItemPricelistRef | null;
}

export interface GoodReceiptItemDetail {
  id?: string | number;
  good_receipt_id: string | number;
  purchase_order_item_id: string | number;
  pricelist_id?: string | number | null;
  product_id?: string | number | null;
  qty_received: number;
  purchase_order_item?: GoodReceiptPurchaseOrderItemRef | null;
  product?: GoodReceiptItemProductRef | null;
  created_at?: string;
  updated_at?: string;
}

export interface GoodReceiptItemDisplayRow {
  id: string;
  purchase_order_item_id: string | number;
  product_name: string;
  qty_ordered: number;
  qty_received: number;
}

export interface GoodReceiptsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedGoodReceipts {
  items: GoodReceiptHead[];
  meta: GoodReceiptsPaginationMeta;
}

export interface GoodReceiptItemsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedGoodReceiptItems {
  items: GoodReceiptItemDetail[];
  meta: GoodReceiptItemsPaginationMeta;
}
