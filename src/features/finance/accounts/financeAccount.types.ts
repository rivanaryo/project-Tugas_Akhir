export interface FinanceAccount {
  id: string;
  account_name: string;
  account_number: string;
  type: 'bank' | 'cash';
  bank_name?: string | null;
  opening_balance: number | string;
  balance: number | string;
  is_active: boolean;
}

export interface FinanceAccountSummaryItem extends Omit<FinanceAccount, 'balance'> {
  cash_in: number | string;
  cash_out: number | string;
  closing_balance: number | string;
  current_balance: number | string;
}

export interface FinanceSummary {
  date_from: string;
  date_to: string;
  opening_balance: number | string;
  cash_in: number | string;
  cash_out: number | string;
  closing_balance: number | string;
  accounts: FinanceAccountSummaryItem[];
}

export type FinanceTransactionDirection = 'in' | 'out';
export type FinanceTransactionStatus = 'posted' | 'void';

export interface FinanceTransaction {
  id: string;
  account_id: string;
  account?: { id: string; account_name: string } | null;
  transaction_date: string;
  direction: FinanceTransactionDirection;
  amount: number | string;
  reference_type: 'customer_payment' | 'vendor_payment' | 'account_adjustment' | 'account_transfer' | 'opening_balance' | 'reversal';
  reference_id?: string | null;
  reference_number?: string | null;
  description?: string | null;
  status: FinanceTransactionStatus;
  transfer_group_id?: string | null;
  reversal_of_id?: string | null;
  created_by?: { id: string; email: string } | null;
  created_at?: string;
  voided_at?: string | null;
}

export interface AdjustmentPayload {
  account_id: string;
  direction: FinanceTransactionDirection;
  amount: number;
  transaction_date: string;
  description: string;
}

export interface TransferPayload {
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  transaction_date: string;
  description?: string;
}
