export interface Product {
  id: string | number;
  product_name: string;
  category_id?: string | number;
  unit_id?: string | number;
  category?: {
    id: string | number;
    category_name: string;
  };
  unit?: {
    id: string | number;
    unit_code?: string;
    unit_name: string;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  meta: ProductsPaginationMeta;
}
