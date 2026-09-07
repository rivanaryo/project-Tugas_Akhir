import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { SalesOrderFilterParams, SalesOrderStatus } from '../types/salesOrder.types';

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

const normalizeStatusFromUrl = (value: string): '' | 'draft' | 'approved' | 'delivered' | 'cancelled' | '0' | '1' | '2' | 'pending' | 'completed' => {
  const text = value.trim().toLowerCase();
  if (!text) return '';
  // Convert new status values to old ones for backend compatibility
  if (text === 'draft' || text === 'pending') return '0';
  if (text === 'delivered' || text === 'completed') return '1';
  if (text === 'cancelled' || text === 'canceled') return '2';
  if (text === 'approved') return 'approved'; // New status, pass through
  // Handle old status values
  if (text === '0' || text === '1' || text === '2') return text;
  if (text === 'true') return '1';
  if (text === 'false') return '0';
  return '';
};

export function useSalesOrderFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const perPage = toPositiveInt(searchParams.get('per_page'), 15);

  const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
  const statusRaw = toNonEmptyString(searchParams.get('status'));
  const customerId = toNonEmptyString(searchParams.get('customer_id'));
  const orderDateFrom = toNonEmptyString(searchParams.get('order_date_from'));
  const orderDateTo = toNonEmptyString(searchParams.get('order_date_to'));

  const status = normalizeStatusFromUrl(statusRaw);

  const debouncedQ = useDebouncedValue(q, 450);

  const uiFilters = useMemo(
    () => ({
      q,
      status,
      customer_id: customerId,
      order_date_from: orderDateFrom,
      order_date_to: orderDateTo,
    }),
    [q, status, customerId, orderDateFrom, orderDateTo]
  );

  const queryFilters: SalesOrderFilterParams = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: (status || undefined) as SalesOrderStatus | undefined,
      customer_id: customerId || undefined,
      order_date_from: orderDateFrom || undefined,
      order_date_to: orderDateTo || undefined,
    }),
    [debouncedQ, status, customerId, orderDateFrom, orderDateTo]
  );

  const updateFilters = (partial: {
    q?: string;
    status?: string;
    customer_id?: string;
    order_date_from?: string;
    order_date_to?: string;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (partial.q !== undefined) setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
    if (partial.status !== undefined) setParam(nextParams, 'status', toNonEmptyString(partial.status));
    if (partial.customer_id !== undefined) setParam(nextParams, 'customer_id', toNonEmptyString(partial.customer_id));
    if (partial.order_date_from !== undefined) setParam(nextParams, 'order_date_from', toNonEmptyString(partial.order_date_from));
    if (partial.order_date_to !== undefined) setParam(nextParams, 'order_date_to', toNonEmptyString(partial.order_date_to));

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
