export interface PricelistVendor {
  id: string | number;
  vendor_name: string;
  contact_person?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PricelistProduct {
  id: string | number;
  product_name: string;
  category_id?: string | number;
  unit_id?: string | number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Pricelist {
  id: string | number;
  vendor_id: string | number;
  product_id: string | number;
  price: string;
  currency: string;
  is_active: boolean;
  vendor?: PricelistVendor;
  product?: PricelistProduct;
  created_at?: string;
  updated_at?: string;
}

export interface PricelistsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedPricelists {
  items: Pricelist[];
  meta: PricelistsPaginationMeta;
}
