export type StockMovementType = 'in' | 'out';

export type ReferenceableType =
  | 'Purchase Order'
  | 'Sales Order'
  | 'Good Receipt'
  | 'Finished Goods Receipt'
  | 'Sales Delivery'
  | 'Stock Opname'
  | 'Unknown';

export type CreateReferenceableType = 'Stock Opname';

export interface StockMovementFilterParams {
  q?: string;
  type?: StockMovementType;
  reference_number?: string;
  product_id?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface ProductRef {
  id: string;
  product_name?: string;
  name?: string;
  product_code?: string;
  unit?: string;
  category_id?: string;
  unit_id?: string;
  is_active?: boolean;
  stock_level?: number;
  min_stock_level?: number;
  warehouse_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseRef {
  id: string;
  name?: string;
  warehouse_name?: string;
  code?: string;
  warehouse_code?: string;
  location?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: string;
  m_products_id?: string | null;
  m_warehouses_id?: string | null;
  type: StockMovementType;
  quantity: number;
  reference_number: string;
  referenceable_id?: string | null;
  referenceable_type?: ReferenceableType | null;
  document_type?: ReferenceableType | null;
  reference?: ReferenceableType | null;
  description?: string | null;
  date?: string;
  product_id?: string;
  warehouse_id?: string;
  product_name?: string | null;
  warehouse_name?: string | null;
  product?: ProductRef | null;
  warehouse?: WarehouseRef | null;
  created_at?: string;
  updated_at?: string;
  stock_before?: number;
  stock_after?: number;
  user_id?: string | null;
}

export interface StockMovementCreateResult {
  id: string;
}

export interface StockMovementPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedStockMovements {
  items: StockMovement[];
  meta: StockMovementPaginationMeta;
}
