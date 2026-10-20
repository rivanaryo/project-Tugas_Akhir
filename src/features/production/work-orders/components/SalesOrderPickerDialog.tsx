import { useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../../../../components/ui/dialog';
import { MasterdataSearchBar } from '../../../masterdata/components/MasterdataSearchBar';
import { useReferenceTableFilters } from '../../../masterdata/hooks/useReferenceTableFilters';
import { useSalesOrders } from '../../../sales/sales-order/hooks/useSalesOrders';
import type { SalesOrderHead } from '../../../sales/sales-order/types/salesOrder.types';

interface SalesOrderPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (salesOrder: SalesOrderHead) => void;
}

export function SalesOrderPickerDialog({ open, onOpenChange, onSelect }: SalesOrderPickerDialogProps) {
	const filters = useReferenceTableFilters(10);
	const { data: salesOrdersData, isLoading, isFetching } = useSalesOrders({
		page: filters.page,
		perPage: filters.perPage,
		filters: filters.queryFilters,
	});

	const meta = salesOrdersData?.meta;

	const visibleSalesOrders = useMemo(() => {
		const items = salesOrdersData?.items ?? [];
		const q = filters.q.trim().toLowerCase();
		if (!q) return items;
		return items.filter((so) =>
			String(so.order_number ?? '').toLowerCase().includes(q) ||
			String(so.customer?.customer_name ?? '').toLowerCase().includes(q)
		);
	}, [salesOrdersData, filters.q]);

	const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
	const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Pilih Sales Order</DialogTitle>
					<DialogDescription>Pilih sales order untuk work order.</DialogDescription>
				</DialogHeader>

				<MasterdataSearchBar
					value={filters.q}
					onChange={filters.updateSearch}
					onReset={filters.resetFilters}
					isLoading={isLoading || isFetching}
					placeholder="Cari nomor SO atau customer"
					variant="compact"
				/>

				<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="sticky top-0 bg-surface-2">
							<tr>
								<th className="px-4 py-3">Nomor SO</th>
								<th className="px-4 py-3">Customer</th>
								<th className="px-4 py-3">Tanggal</th>
								<th className="px-4 py-3 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td className="px-4 py-4" colSpan={4}>
										Loading sales orders...
									</td>
								</tr>
							) : visibleSalesOrders.length === 0 ? (
								<tr>
									<td className="px-4 py-4" colSpan={4}>
										No sales orders found.
									</td>
								</tr>
							) : (
								visibleSalesOrders.map((salesOrder) => (
									<tr key={salesOrder.id} className="border-t border-border/70">
										<td className="px-4 py-3 font-medium text-text-h">
											{salesOrder.order_number}
										</td>
										<td className="px-4 py-3 text-text">
											{salesOrder.customer?.customer_name ?? '-'}
										</td>
										<td className="px-4 py-3 text-text">
											{salesOrder.order_date}
										</td>
										<td className="px-4 py-3 text-right">
											<Button type="button" size="sm" onClick={() => onSelect(salesOrder)}>
												Pilih
											</Button>
										</td>
									</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<DialogFooter>
						<div className="mr-auto flex items-center gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => filters.setPage(filters.page - 1)}
								disabled={!canGoPrev}
							>
								Previous
							</Button>
							<span className="text-xs text-text">
								Page {meta?.currentPage ?? filters.page} / {meta?.lastPage ?? 1}
							</span>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() =>
									filters.setPage(
										Math.min(meta?.lastPage ?? filters.page + 1, filters.page + 1)
									)
								}
								disabled={!canGoNext}
							>
								Next
							</Button>
						</div>
						<Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
		</Dialog>
	);
}
