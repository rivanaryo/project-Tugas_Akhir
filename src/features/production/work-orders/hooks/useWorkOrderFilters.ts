import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import type { WorkOrderFilterParams } from '../types/workOrder.types';

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

export function useWorkOrderFilters(defaultPerPage = 15) {
	const [searchParams, setSearchParams] = useSearchParams();

	const page = toPositiveInt(searchParams.get('page'), 1);
	const perPage = toPositiveInt(searchParams.get('per_page'), defaultPerPage);
	const q = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('q')));
	const status = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('status')));
	const stage = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('stage')));
	const salesOrderId = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('sales_order_id')));
	const productId = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('product_id')));
	const dateFrom = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('date_from')));
	const dateTo = normalizeBlankToEmpty(toStringOrEmpty(searchParams.get('date_to')));

	const debouncedQ = useDebouncedValue(q, 450);

	const uiFilters = useMemo(
		() => ({
			q,
			status: status as WorkOrderFilterParams['status'],
			stage,
			sales_order_id: salesOrderId,
			product_id: productId,
			date_from: dateFrom,
			date_to: dateTo,
		}),
		[q, status, stage, salesOrderId, productId, dateFrom, dateTo]
	);

	const queryFilters = useMemo<WorkOrderFilterParams>(
		() => ({
			q: debouncedQ.trim() || undefined,
			status: (status as WorkOrderFilterParams['status']) || undefined,
			stage: stage || undefined,
			sales_order_id: salesOrderId || undefined,
			product_id: productId || undefined,
			date_from: dateFrom || undefined,
			date_to: dateTo || undefined,
		}),
		[debouncedQ, status, stage, salesOrderId, productId, dateFrom, dateTo]
	);

	const updateFilters = (partial: WorkOrderFilterParams) => {
		const nextParams = new URLSearchParams(searchParams);

		if (partial.q !== undefined) setParam(nextParams, 'q', normalizeBlankToEmpty(toStringOrEmpty(partial.q)));
		if (partial.status !== undefined) setParam(nextParams, 'status', normalizeBlankToEmpty(toStringOrEmpty(partial.status)));
		if (partial.stage !== undefined) setParam(nextParams, 'stage', normalizeBlankToEmpty(toStringOrEmpty(partial.stage)));
		if (partial.sales_order_id !== undefined) setParam(nextParams, 'sales_order_id', normalizeBlankToEmpty(toStringOrEmpty(partial.sales_order_id)));
		if (partial.product_id !== undefined) setParam(nextParams, 'product_id', normalizeBlankToEmpty(toStringOrEmpty(partial.product_id)));
		if (partial.date_from !== undefined) setParam(nextParams, 'date_from', normalizeBlankToEmpty(toStringOrEmpty(partial.date_from)));
		if (partial.date_to !== undefined) setParam(nextParams, 'date_to', normalizeBlankToEmpty(toStringOrEmpty(partial.date_to)));

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
	};
}
