import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';

export interface MasterdataListFilterParams {
  q?: string;
  warehouse_id?: string;
}

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

export function useMasterdataListFilters(defaultPerPage = 15) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = toPositiveInt(searchParams.get('page'), 1);
  const perPage = toPositiveInt(searchParams.get('per_page'), defaultPerPage);
  const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
  const debouncedQ = useDebouncedValue(q, 450);

  const uiFilters = useMemo(
    () => ({
      q,
    }),
    [q]
  );

  const queryFilters = useMemo<MasterdataListFilterParams>(
    () => ({
      q: debouncedQ.trim() || undefined,
    }),
    [debouncedQ]
  );

  const updateFilters = (partial: { q?: string }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (partial.q !== undefined) {
      setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
    }

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
