export interface Warehouse {
  id: string | number;
  code: string;
  name: string;
  location: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WarehousesPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedWarehouses {
  items: Warehouse[];
  meta: WarehousesPaginationMeta;
}
