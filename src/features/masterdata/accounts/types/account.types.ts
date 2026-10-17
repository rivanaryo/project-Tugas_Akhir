export interface Account {
  id: string | number;
  account_name: string;
  account_number: string;
  type: 'bank' | 'cash';
  balance: string | number;
  bank_name?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AccountsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedAccounts {
  items: Account[];
  meta: AccountsPaginationMeta;
}
