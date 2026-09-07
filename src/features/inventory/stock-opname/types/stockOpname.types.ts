export interface StockOpnameItem {
  id: string;
  m_products_id?: string;
  product?: {
    id: string;
    name?: string;
    product_name?: string;
  } | null;
  system_qty?: number;
  physical_qty: number;
  difference_qty?: number;
  notes?: string | null;
}

export interface StockOpname {
  id: string;
  opname_number: string;
  opname_date: string;
  m_warehouses_id?: string;
  warehouse?: {
    id: string;
    name?: string;
    warehouse_name?: string;
  } | null;
  status: string;
  notes?: string | null;
  created_by?: string | null;
  items: StockOpnameItem[];
  created_at?: string;
  updated_at?: string;
}

export interface StockOpnameFilterParams {
  q?: string;
  status?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface StockOpnameCreateResult {
  id: string;
}

export interface StockOpnamePaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedStockOpnames {
  items: StockOpname[];
  meta: StockOpnamePaginationMeta;
}
