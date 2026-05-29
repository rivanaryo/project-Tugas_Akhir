export interface Category {
  id: string | number;
  category_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedCategories {
  items: Category[];
  meta: CategoriesPaginationMeta;
}
