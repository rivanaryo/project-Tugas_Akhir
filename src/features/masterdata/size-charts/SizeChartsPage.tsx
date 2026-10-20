"use no memo";

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../../../components/ui/dialog';
import { MasterdataSearchBar } from '../components/MasterdataSearchBar';
import { useMasterdataListFilters } from '../hooks/useMasterdataListFilters';
import { AddSizeChartDialog } from './components/AddSizeChartDialog';
import { EditSizeChartDialog } from './components/EditSizeChartDialog';
import { useDeleteSizeChart } from './hooks/useDeleteSizeChart';
import { useSizeCharts } from './hooks/useSizeCharts';
import type { SizeChart } from './types/sizeChart.types';

interface SizeChartGroup {
	productId: string;
	productName: string;
	rows: SizeChart[];
}

export function SizeChartsPage() {
	"use no memo";

	const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } =
		useMasterdataListFilters();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedChart, setSelectedChart] = useState<SizeChart | null>(null);

	const { data, isLoading, isError, isFetching } = useSizeCharts({
		page,
		perPage,
		filters: queryFilters,
	});

	const meta = data?.meta;

	const grouped = useMemo<SizeChartGroup[]>(() => {
		const items = data?.items ?? [];
		const map = new Map<string, SizeChartGroup>();

		items.forEach((chart) => {
			const key = chart.product_id;
			const existing = map.get(key);
			const productName = chart.product?.product_name ?? 'Produk tidak diketahui';

			if (existing) {
				existing.rows.push(chart);
			} else {
				map.set(key, {
					productId: key,
					productName,
					rows: [chart],
				});
			}
		});

		return Array.from(map.values());
	}, [data]);

	const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
	const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

	const handlePrevPage = () => {
		if (!canGoPrev) return;
		setPage(page - 1);
	};

	const handleNextPage = () => {
		if (!canGoNext || !meta) return;
		setPage(Math.min(meta.lastPage, page + 1));
	};

	const deleteMutation = useDeleteSizeChart();

	const handleDelete = (chart: SizeChart) => {
		setSelectedChart(chart);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedChart) return;

		setDeletingId(selectedChart.id);
		try {
			const result = await deleteMutation.mutateAsync(selectedChart.id);
			toast.success(result.message);
			setIsDeleteDialogOpen(false);
			setSelectedChart(null);
		} catch {
			toast.error('Gagal menghapus size chart.');
		} finally {
			setDeletingId(null);
		}
	};

	const formatMeasurement = (value: number | null | undefined) => {
		if (value === null || value === undefined) return '-';
		return `${value} cm`;
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link to="/masterdata">Masterdata</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Size Charts & Specs</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="space-y-1">
							<CardTitle className="text-2xl">Size Charts & Specs</CardTitle>
							<CardDescription>
								Standar ukuran dan spesifikasi untuk setiap produk.
							</CardDescription>
						</div>
						<AddSizeChartDialog />
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<MasterdataSearchBar
							value={uiFilters.q}
							onChange={(q) => updateFilters({ q })}
							onReset={resetFilters}
							isLoading={isLoading || isFetching}
							placeholder="Cari nama produk"
							label="Search"
						/>

						{isLoading ? (
							<p className="text-sm text-text">Memuat size charts...</p>
						) : isError ? (
							<p className="text-sm text-rose-400">Gagal memuat size charts.</p>
						) : grouped.length === 0 ? (
							<div className="rounded-xl border border-border/80 p-8 text-center">
								<p className="text-text">Belum ada size chart. Klik tombol Tambah Size Chart untuk membuat.</p>
							</div>
						) : (
							<div className="space-y-4">
								{grouped.map((group) => (
									<Card key={group.productId}>
										<CardHeader>
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
													<Package className="h-5 w-5" />
												</div>
												<CardTitle className="text-lg">{group.productName}</CardTitle>
											</div>
										</CardHeader>
										<CardContent>
											<div className="overflow-x-auto rounded-xl border border-border">
												<table className="w-full text-left text-sm">
													<thead className="bg-surface-2">
														<tr>
															<th className="px-4 py-3 font-semibold text-text-h">Size</th>
															<th className="px-4 py-3 font-semibold text-text-h">Lebar Dada</th>
															<th className="px-4 py-3 font-semibold text-text-h">Panjang Baju</th>
															<th className="px-4 py-3 font-semibold text-text-h">Panjang Lengan</th>
															<th className="px-4 py-3 font-semibold text-text-h">Lebar Bahu</th>
															<th className="px-4 py-3 text-right font-semibold text-text-h">Aksi</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-border bg-surface-1">
														{group.rows.map((row) => (
															<tr key={row.id} className="hover:bg-surface-2/70">
																<td className="px-4 py-3">
																	<Badge variant="secondary">{row.size}</Badge>
																</td>
																<td className="px-4 py-3 text-text">{formatMeasurement(row.chest_width)}</td>
																<td className="px-4 py-3 text-text">{formatMeasurement(row.body_length)}</td>
																<td className="px-4 py-3 text-text">{formatMeasurement(row.sleeve_length)}</td>
																<td className="px-4 py-3 text-text">{formatMeasurement(row.shoulder_width)}</td>
																<td className="px-4 py-3 text-right">
																	<div className="flex justify-end gap-1">
																		<EditSizeChartDialog sizeChart={row} />
																		<Button
																			type="button"
																			variant="ghost"
																			size="sm"
																			className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
																			onClick={() => handleDelete(row)}
																			aria-label={`Hapus size ${row.size}`}
																			disabled={deletingId === row.id}
																		>
																			<Trash2 className="h-4 w-4" />
																		</Button>
																	</div>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm text-text">
								{meta
									? `Showing ${meta.from}-${meta.to} of ${meta.total} size charts`
									: 'Showing 0 size charts'}
							</p>

							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={handlePrevPage}
									disabled={!canGoPrev}
								>
									Previous
								</Button>
								<span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
									Page {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
								</span>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={handleNextPage}
									disabled={!canGoNext}
								>
									Next
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => {
					setIsDeleteDialogOpen(open);
					if (!open) setSelectedChart(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Hapus Size Chart</DialogTitle>
						<DialogDescription>
							{selectedChart
								? `Yakin ingin menghapus size ${selectedChart.size} untuk produk "${selectedChart.product?.product_name ?? ''}"?`
								: 'Yakin ingin menghapus size chart ini?'}
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="secondary" disabled={deleteMutation.isPending}>
								Batal
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteMutation.isPending || !selectedChart}
						>
							{deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
