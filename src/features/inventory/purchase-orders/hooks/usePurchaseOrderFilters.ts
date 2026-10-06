import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { PurchaseOrderFilterParams } from '../types/purchaseOrder.types';

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

export function usePurchaseOrderFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const perPage = toPositiveInt(searchParams.get('per_page'), 15);

  const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
  const statusRaw = toNonEmptyString(searchParams.get('status'));
  const vendorId = toNonEmptyString(searchParams.get('vendor_id'));
  const poDateFrom = toNonEmptyString(searchParams.get('po_date_from'));
  const poDateTo = toNonEmptyString(searchParams.get('po_date_to'));

  const status = (() => {
    const text = statusRaw.trim().toLowerCase();
    if (!text) return '';
    if (['draft', 'pending', 'partially_received', 'completed', 'cancelled'].includes(text)) return text;
    return '';
  })();

  const debouncedQ = useDebouncedValue(q, 450);

  const uiFilters = useMemo(
    () => ({
      q,
      status,
      vendor_id: vendorId,
      po_date_from: poDateFrom,
      po_date_to: poDateTo,
    }),
    [q, status, vendorId, poDateFrom, poDateTo]
  );

  const queryFilters: PurchaseOrderFilterParams = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: (status || undefined) as PurchaseOrderFilterParams['status'] | undefined,
      vendor_id: vendorId || undefined,
      po_date_from: poDateFrom || undefined,
      po_date_to: poDateTo || undefined,
    }),
    [debouncedQ, status, vendorId, poDateFrom, poDateTo]
  );

  const updateFilters = (partial: {
    q?: string;
    status?: string;
    vendor_id?: string;
    po_date_from?: string;
    po_date_to?: string;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (partial.q !== undefined) setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
    if (partial.status !== undefined) setParam(nextParams, 'status', toNonEmptyString(partial.status));
    if (partial.vendor_id !== undefined) setParam(nextParams, 'vendor_id', toNonEmptyString(partial.vendor_id));
    if (partial.po_date_from !== undefined) setParam(nextParams, 'po_date_from', toNonEmptyString(partial.po_date_from));
    if (partial.po_date_to !== undefined) setParam(nextParams, 'po_date_to', toNonEmptyString(partial.po_date_to));

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

  return {
    page,
    perPage,
    uiFilters,
    queryFilters,
    setPage,
    updateFilters,
    resetFilters,
    debouncedQ,
  };
}
