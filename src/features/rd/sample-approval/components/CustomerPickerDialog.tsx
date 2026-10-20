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
import { useCustomers } from '../../../masterdata/customers/hooks/useCustomers';
import type { Customer } from '../../../masterdata/customers/types/customer.types';

interface CustomerPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (customer: Customer) => void;
}

export function CustomerPickerDialog({ open, onOpenChange, onSelect }: CustomerPickerDialogProps) {
	const filters = useReferenceTableFilters(10);
	const { data: customersData, isLoading, isFetching } = useCustomers({
		page: filters.page,
		perPage: filters.perPage,
		filters: filters.queryFilters,
	});

	const meta = customersData?.meta;

	const visibleCustomers = useMemo(() => {
		const items = customersData?.items ?? [];
		const q = filters.q.trim().toLowerCase();
		if (!q) return items;
		return items.filter((customer) =>
			String(customer.customer_name ?? '').toLowerCase().includes(q) ||
			String(customer.contact_person ?? '').toLowerCase().includes(q)
		);
	}, [customersData, filters.q]);

	const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
	const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Pilih Customer</DialogTitle>
					<DialogDescription>Pilih customer untuk sample approval.</DialogDescription>
				</DialogHeader>

				<MasterdataSearchBar
					value={filters.q}
					onChange={filters.updateSearch}
					onReset={filters.resetFilters}
					isLoading={isLoading || isFetching}
					placeholder="Cari nama customer"
					variant="compact"
				/>

				<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="sticky top-0 bg-surface-2">
							<tr>
								<th className="px-4 py-3">Nama Customer</th>
								<th className="px-4 py-3">Contact Person</th>
								<th className="px-4 py-3 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td className="px-4 py-4" colSpan={3}>
										Loading customers...
									</td>
								</tr>
							) : visibleCustomers.length === 0 ? (
								<tr>
									<td className="px-4 py-4" colSpan={3}>
										No customers found.
									</td>
								</tr>
							) : (
								visibleCustomers.map((customer) => (
									<tr key={customer.id} className="border-t border-border/70">
										<td className="px-4 py-3 font-medium text-text-h">
											{customer.customer_name}
										</td>
										<td className="px-4 py-3 text-text">
											{customer.contact_person ?? '-'}
										</td>
										<td className="px-4 py-3 text-right">
											<Button type="button" size="sm" onClick={() => onSelect(customer)}>
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
