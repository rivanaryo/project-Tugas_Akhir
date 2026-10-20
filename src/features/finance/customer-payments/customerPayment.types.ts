export type CustomerPaymentType = 'dp' | 'pelunasan';
export type CustomerPaymentStatus = 'paid' | 'pending';

export interface CustomerPayment {
  id: string;
  payment_number: string;
  sales_order_id: string;
  sales_order?: { id: string; order_number: string } | null;
  customer_id: string;
  customer?: { id: string; customer_name: string } | null;
  type: CustomerPaymentType;
  amount: number | string;
  account_id: string;
  account?: { id: string; account_name: string } | null;
  payment_date?: string | null;
  status: CustomerPaymentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPaymentPayload {
  payment_number: string;
  sales_order_id: string;
  customer_id: string;
  type: CustomerPaymentType;
  amount: number;
  account_id: string;
  payment_date?: string;
  status: CustomerPaymentStatus;
}

export interface FinanceAccountReference {
  id: string;
  account_name: string;
  account_number: string;
  type: 'bank' | 'cash';
  balance: number | string;
  bank_name?: string | null;
  is_active: boolean;
}
