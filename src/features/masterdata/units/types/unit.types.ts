export interface Unit {
  id: string | number;
  unit_code?: string;
  unit_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedUnits {
  items: Unit[];
  meta: UnitsPaginationMeta;
}
