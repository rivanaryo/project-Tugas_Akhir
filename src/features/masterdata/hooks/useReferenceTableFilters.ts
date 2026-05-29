import { useMemo, useState } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { MasterdataListFilterParams } from './useMasterdataListFilters';

const sanitizePage = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.floor(value);
};

export function useReferenceTableFilters(initialPerPage = 10) {
  const [page, setPageState] = useState(1);
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 450);

  const queryFilters = useMemo<MasterdataListFilterParams>(
    () => ({
      q: debouncedQ.trim() || undefined,
    }),
    [debouncedQ]
  );

  const setPage = (nextPage: number) => {
    setPageState(sanitizePage(nextPage));
  };

  const updateSearch = (nextValue: string) => {
    setQ(nextValue);
    setPageState(1);
  };

  const resetFilters = () => {
    setQ('');
    setPageState(1);
  };

  return {
    page,
    perPage: initialPerPage,
    q,
    queryFilters,
    setPage,
    updateSearch,
    resetFilters,
  };
}
