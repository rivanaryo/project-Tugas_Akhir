import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { SalesDeliveryFilterParams, SalesDeliveryStatus } from '../types/salesDelivery.types';

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

// PERBAIKAN: Pastikan string kosong "" benar-benar menghapus param dari URL
const setParam = (params: URLSearchParams, key: string, value: string) => {
  if (value !== undefined && value !== null && value !== '') {
    params.set(key, value);
  } else {
    params.delete(key);
  }
};

export function useSalesDeliveryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const perPage = toPositiveInt(searchParams.get('per_page'), 15);

  const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
  const statusRaw = toNonEmptyString(searchParams.get('status'));
  const deliveryDateFrom = toNonEmptyString(searchParams.get('delivery_date_from'));
  const deliveryDateTo = toNonEmptyString(searchParams.get('delivery_date_to'));

  const status = (() => {
    const text = statusRaw.trim().toLowerCase();
    if (!text) return '';
    if (text === '0' || text === '1' || text === '2') return text;
    if (text === 'true') return '1';
    if (text === 'false') return '0';
    if (text === 'pending') return '0';
    if (text === 'completed') return '1';
    if (text === 'cancelled' || text === 'canceled') return '2';
    return '';
  })();

  const debouncedQ = useDebouncedValue(q, 450);

  const uiFilters = useMemo(
    () => ({
      q,
      status,
      delivery_date_from: deliveryDateFrom,
      delivery_date_to: deliveryDateTo,
    }),
    [q, status, deliveryDateFrom, deliveryDateTo]
  );

  const queryFilters: SalesDeliveryFilterParams = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: (status || undefined) as SalesDeliveryStatus | undefined,
      delivery_date_from: deliveryDateFrom || undefined,
      delivery_date_to: deliveryDateTo || undefined,
    }),
    [debouncedQ, status, deliveryDateFrom, deliveryDateTo]
  );

  const updateFilters = useCallback(
    (partial: {
      q?: string;
      status?: string;
      delivery_date_from?: string;
      delivery_date_to?: string;
    }) => {
      // PERBAIKAN: Gunakan functional update bawaan react-router untuk menghindari race condition URL
      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams);

        if (partial.q !== undefined) setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
        if (partial.status !== undefined) setParam(nextParams, 'status', toNonEmptyString(partial.status));
        if (partial.delivery_date_from !== undefined)
          setParam(nextParams, 'delivery_date_from', toNonEmptyString(partial.delivery_date_from));
        if (partial.delivery_date_to !== undefined)
          setParam(nextParams, 'delivery_date_to', toNonEmptyString(partial.delivery_date_to));

        nextParams.set('page', '1'); // Reset ke halaman 1 setiap kali filter berubah
        nextParams.set('per_page', String(perPage));

        return nextParams;
      });
    },
    [perPage, setSearchParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const sanitized = Number.isFinite(nextPage) && nextPage > 0 ? Math.floor(nextPage) : 1;

      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams);
        nextParams.set('page', String(sanitized));
        nextParams.set('per_page', String(perPage));
        return nextParams;
      });
    },
    [perPage, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

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
