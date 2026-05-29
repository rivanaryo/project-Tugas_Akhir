export interface Customer {
  id: string | number;
  customer_name: string;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomersPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedCustomers {
  items: Customer[];
  meta: CustomersPaginationMeta;
}
