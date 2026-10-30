import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { SalesInvoiceFilterParams, SalesInvoiceStatus } from '../types/salesInvoices';

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

export function useSalesInvoiceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const perPage = toPositiveInt(searchParams.get('per_page'), 15);

  const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
  const statusRaw = toNonEmptyString(searchParams.get('status'));
  const invoiceDateFrom = toNonEmptyString(searchParams.get('invoice_date_from'));
  const invoiceDateTo = toNonEmptyString(searchParams.get('invoice_date_to'));

  // Memastikan status yang valid saja yang lolos
  const status = (statusRaw === 'pending' || statusRaw === 'approved' || statusRaw === 'completed' || statusRaw === 'paid' || statusRaw === 'cancelled' || statusRaw === 'false' || statusRaw === 'true' ? statusRaw : '') as
    | string
    | '';

  const debouncedQ = useDebouncedValue(q, 450);

  const uiFilters = useMemo(
    () => ({
      q,
      status,
      invoice_date_from: invoiceDateFrom,
      invoice_date_to: invoiceDateTo,
    }),
    [q, status, invoiceDateFrom, invoiceDateTo]
  );

  const queryFilters: SalesInvoiceFilterParams = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      // PERBAIKAN: Jika status kosong, ubah jadi undefined agar tidak ikut terkirim ke API
      status: (status === 'false' ? false : status === 'true' ? true : status || undefined) as SalesInvoiceStatus | undefined,
      invoice_date_from: invoiceDateFrom || undefined,
      invoice_date_to: invoiceDateTo || undefined,
    }),
    [debouncedQ, status, invoiceDateFrom, invoiceDateTo]
  );

  const updateFilters = useCallback(
    (partial: {
      q?: string;
      status?: string;
      invoice_date_from?: string;
      invoice_date_to?: string;
    }) => {
      // PERBAIKAN: Gunakan functional update bawaan react-router untuk menghindari race condition URL
      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams);

        if (partial.q !== undefined) setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
        if (partial.status !== undefined) setParam(nextParams, 'status', toNonEmptyString(partial.status));
        if (partial.invoice_date_from !== undefined)
          setParam(nextParams, 'invoice_date_from', toNonEmptyString(partial.invoice_date_from));
        if (partial.invoice_date_to !== undefined)
          setParam(nextParams, 'invoice_date_to', toNonEmptyString(partial.invoice_date_to));

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
