import { useMemo, useState } from 'react';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { VendorPaymentFilterParams } from '../types/VendorPayment';

const sanitizePage = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.floor(value);
};

export function useVendorPaymentFilters(initialPerPage = 15) {
  const [page, setPageState] = useState(1);
  const [q, setQ] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [paymentType, setPaymentType] = useState<'transfer' | 'cash' | 'credit' | ''>('');
  const [paymentDateFrom, setPaymentDateFrom] = useState('');
  const [paymentDateTo, setPaymentDateTo] = useState('');
  const [accountId, setAccountId] = useState('');

  const debouncedQ = useDebouncedValue(q, 450);

  const queryFilters = useMemo<VendorPaymentFilterParams>(
    () => ({
      q: debouncedQ.trim() || undefined,
      vendor_id: vendorId.trim() || undefined,
      payment_type: paymentType || undefined,
      payment_date_from: paymentDateFrom || undefined,
      payment_date_to: paymentDateTo || undefined,
      account_id: accountId.trim() || undefined,
    }),
    [debouncedQ, vendorId, paymentType, paymentDateFrom, paymentDateTo, accountId]
  );

  const setPage = (nextPage: number) => {
    setPageState(sanitizePage(nextPage));
  };

  const updateSearch = (nextValue: string) => {
    setQ(nextValue);
    setPageState(1);
  };

  const updateVendorId = (nextValue: string) => {
    setVendorId(nextValue);
    setPageState(1);
  };

  const updatePaymentType = (nextValue: 'transfer' | 'cash' | 'credit' | '') => {
    setPaymentType(nextValue);
    setPageState(1);
  };

  const updatePaymentDateFrom = (nextValue: string) => {
    setPaymentDateFrom(nextValue);
    setPageState(1);
  };

  const updatePaymentDateTo = (nextValue: string) => {
    setPaymentDateTo(nextValue);
    setPageState(1);
  };

  const updateAccountId = (nextValue: string) => {
    setAccountId(nextValue);
    setPageState(1);
  };

  const resetFilters = () => {
    setQ('');
    setVendorId('');
    setPaymentType('');
    setPaymentDateFrom('');
    setPaymentDateTo('');
    setAccountId('');
    setPageState(1);
  };

  return {
    page,
    perPage: initialPerPage,
    q,
    vendorId,
    paymentType,
    paymentDateFrom,
    paymentDateTo,
    accountId,
    queryFilters,
    setPage,
    updateSearch,
    updateVendorId,
    updatePaymentType,
    updatePaymentDateFrom,
    updatePaymentDateTo,
    updateAccountId,
    resetFilters,
  };
}