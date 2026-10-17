export type VendorPaymentStatus = 'unpaid' | 'paid';

export interface VendorPayment {
    id: string;
    payment_number: string;
    vendor_id: string;
    contact_person?: string;
    vendor_invoice_number: string;
    payment_type: 'transfer' | 'cash' | 'giro' | 'downpayment';
    payment_date: string;
    total_paid: string;
    account_id: string;
    status: VendorPaymentStatus;
    vendor?: { id: string | number; vendor_name: string } | null;
    account?: { id: string | number; account_name: string; account_number?: string; bank_name?: string | null } | null;
    created_at: string;
    updated_at: string;
}

export interface VendorPaymentFilterParams {
  q?: string;
  vendor_id?: string;
  payment_type?: 'transfer' | 'cash' | 'giro' | 'downpayment';
  status?: VendorPaymentStatus;
  payment_date_from?: string;
  payment_date_to?: string;
  account_id?: string;
}

export interface VendorPaymentsPaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedVendorPayments {
  items: VendorPayment[];
  meta: VendorPaymentsPaginationMeta;
}

export interface VendorPaymentCreateResult {
  data: VendorPayment;
  message: string;
}

