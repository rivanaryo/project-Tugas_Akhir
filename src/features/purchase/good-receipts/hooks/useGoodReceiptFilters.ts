import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { GoodReceiptFilterParams, GoodReceiptStatus } from '../types/goodReceipt.types';

const toNonEmptyString = (value: string | null | undefined) => {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : '';
};

const toStringOrEmpty = (value: string | null | undefined) => String(value ?? '');
const normalizeBlankToEmpty = (value: string) => (value.trim().length === 0 ? '' : value);
const toPositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};
const setParam = (params: URLSearchParams, key: string, value: string) => {
  if (value) params.set(key, value);
  else params.delete(key);
};

export function useGoodReceiptFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = toPositiveInt(searchParams.get('page'), 1);
  const perPage = toPositiveInt(searchParams.get('per_page'), 15);
  const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
  const statusRaw = toNonEmptyString(searchParams.get('status'));
  const vendorId = toNonEmptyString(searchParams.get('vendor_id'));
  const receiptDateFrom = toNonEmptyString(searchParams.get('receipt_date_from'));
  const receiptDateTo = toNonEmptyString(searchParams.get('receipt_date_to'));
  const status = (statusRaw === 'pending' || statusRaw === 'completed' ? statusRaw : '') as GoodReceiptStatus | '';
  const debouncedQ = useDebouncedValue(q, 450);

  const uiFilters = useMemo(() => ({ q, status, vendor_id: vendorId, receipt_date_from: receiptDateFrom, receipt_date_to: receiptDateTo }), [q, status, vendorId, receiptDateFrom, receiptDateTo]);
  const queryFilters: GoodReceiptFilterParams = useMemo(() => ({ q: debouncedQ.trim() || undefined, status: status || undefined, vendor_id: vendorId || undefined, receipt_date_from: receiptDateFrom || undefined, receipt_date_to: receiptDateTo || undefined }), [debouncedQ, status, vendorId, receiptDateFrom, receiptDateTo]);

  const updateFilters = (partial: { q?: string; status?: string; vendor_id?: string; receipt_date_from?: string; receipt_date_to?: string }) => {
    const nextParams = new URLSearchParams(searchParams);
    if (partial.q !== undefined) setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
    if (partial.status !== undefined) setParam(nextParams, 'status', toNonEmptyString(partial.status));
    if (partial.vendor_id !== undefined) setParam(nextParams, 'vendor_id', toNonEmptyString(partial.vendor_id));
    if (partial.receipt_date_from !== undefined) setParam(nextParams, 'receipt_date_from', toNonEmptyString(partial.receipt_date_from));
    if (partial.receipt_date_to !== undefined) setParam(nextParams, 'receipt_date_to', toNonEmptyString(partial.receipt_date_to));
    nextParams.set('page', '1');
    nextParams.set('per_page', String(perPage));
    setSearchParams(nextParams);
  };

  const setPage = (nextPage: number) => {
    const sanitized = Number.isFinite(nextPage) && nextPage > 0 ? Math.floor(nextPage) : 1;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(sanitized));
    nextParams.set('per_page', String(perPage));
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams();
    nextParams.set('page', '1');
    nextParams.set('per_page', String(perPage));
    setSearchParams(nextParams);
  };

  return { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters };
}
