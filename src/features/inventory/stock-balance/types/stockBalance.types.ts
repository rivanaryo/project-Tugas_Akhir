export interface StockBalanceItem {
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code: string;
  unit_code: string;
  total_in: number;
  total_out: number;
  current_stock: number;
}

export interface StockBalanceFilterParams {
  q?: string;
  warehouse_id?: string;
  product_id?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface StockBalancePaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedStockBalance {
  items: StockBalanceItem[];
  meta: StockBalancePaginationMeta;
}

export interface StockBalanceSummary {
  totalProducts: number;
  totalWarehouses: number;
  negativeStockCount: number;
  safeStockCount: number;
}
