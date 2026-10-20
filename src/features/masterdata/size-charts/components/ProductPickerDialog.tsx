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
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useReferenceTableFilters } from '../../hooks/useReferenceTableFilters';
import { useProducts } from '../../items/hooks/useProducts';
import type { Product } from '../../items/types/product.types';

interface ProductPickerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (product: Product) => void;
}

export function ProductPickerDialog({ open, onOpenChange, onSelect }: ProductPickerDialogProps) {
	const filters = useReferenceTableFilters(10);
	const { data: productsData, isLoading, isFetching } = useProducts({
		page: filters.page,
		perPage: filters.perPage,
		filters: filters.queryFilters,
	});

	const meta = productsData?.meta;

	const visibleProducts = useMemo(() => {
		const items = productsData?.items ?? [];
		const q = filters.q.trim().toLowerCase();
		if (!q) return items;
		return items.filter((product) =>
			String(product.product_name ?? '').toLowerCase().includes(q)
		);
	}, [productsData, filters.q]);

	const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
	const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Pilih Produk</DialogTitle>
					<DialogDescription>Pilih produk untuk size chart.</DialogDescription>
				</DialogHeader>

				<MasterdataSearchBar
					value={filters.q}
					onChange={filters.updateSearch}
					onReset={filters.resetFilters}
					isLoading={isLoading || isFetching}
					placeholder="Cari nama produk"
					variant="compact"
				/>

				<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="sticky top-0 bg-surface-2">
							<tr>
								<th className="px-4 py-3">Nama Produk</th>
								<th className="px-4 py-3">Kategori</th>
								<th className="px-4 py-3 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td className="px-4 py-4" colSpan={3}>
										Loading products...
									</td>
								</tr>
							) : visibleProducts.length === 0 ? (
								<tr>
									<td className="px-4 py-4" colSpan={3}>
										No products found.
									</td>
								</tr>
							) : (
								visibleProducts.map((product) => (
									<tr key={product.id} className="border-t border-border/70">
										<td className="px-4 py-3 font-medium text-text-h">
											{product.product_name}
										</td>
										<td className="px-4 py-3 text-text">
											{product.category?.category_name ?? '-'}
										</td>
										<td className="px-4 py-3 text-right">
											<Button type="button" size="sm" onClick={() => onSelect(product)}>
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
