import { useState } from 'react';
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
import { AddWorkOrderDialog } from './components/AddWorkOrderDialog';
import { EditWorkOrderDialog } from './components/EditWorkOrderDialog';
import { WorkOrderCard } from './components/WorkOrderCard';
import { WorkOrdersFilterBar } from './components/WorkOrdersFilterBar';
import { useDeleteWorkOrder } from './hooks/useDeleteWorkOrder';
import { useWorkOrderFilters } from './hooks/useWorkOrderFilters';
import { useWorkOrders } from './hooks/useWorkOrders';
import type { WorkOrder } from './types/workOrder.types';

export function WorkOrdersPage() {
	const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useWorkOrderFilters();
	const { data, isLoading, isError, isFetching } = useWorkOrders({ page, perPage, filters: queryFilters });
	const deleteMutation = useDeleteWorkOrder();

	const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const workOrders = data?.items ?? [];
	const meta = data?.meta;

	const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
	const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

	const handleDelete = (workOrder: WorkOrder) => {
		setSelectedWorkOrder(workOrder);
		setIsDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedWorkOrder) return;
		deleteMutation.mutate(selectedWorkOrder.id, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				setSelectedWorkOrder(null);
			},
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle className="text-2xl">Work Orders / SPK</CardTitle>
							<CardDescription>
								Surat Perintah Kerja produksi untuk pesanan Make-to-Order.
							</CardDescription>
						</div>
						<AddWorkOrderDialog />
					</div>
				</CardHeader>
			</Card>

			<WorkOrdersFilterBar
				filters={uiFilters}
				onChange={updateFilters}
				onReset={resetFilters}
				isLoading={isLoading || isFetching}
			/>

			{isError ? (
				<Card>
					<CardContent className="p-6 text-center text-sm text-destructive">
						Gagal memuat Work Orders. Silakan coba lagi.
					</CardContent>
				</Card>
			) : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{isLoading && workOrders.length === 0
					? Array.from({ length: 6 }).map((_, index) => (
							<Card key={index} className="border-border/50 bg-surface-1">
								<CardContent className="space-y-3 p-4">
									<div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
									<div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
									<div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
									<div className="h-2 w-full animate-pulse rounded-full bg-surface-2" />
								</CardContent>
							</Card>
						))
					: workOrders.map((workOrder) => (
							<div key={workOrder.id} className="group relative">
								<WorkOrderCard
									workOrder={workOrder}
									onDelete={handleDelete}
								/>
								<div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
									<EditWorkOrderDialog workOrder={workOrder} />
								</div>
							</div>
						))}
			</div>

			{!isLoading && workOrders.length === 0 ? (
				<Card>
					<CardContent className="p-6 text-center text-sm text-text">
						Tidak ada Work Orders yang sesuai filter.
					</CardContent>
				</Card>
			) : null}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-text">
					{meta ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} work orders` : 'Menampilkan 0 work orders'}
				</p>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => setPage(Math.max(1, page - 1))}
						disabled={!canGoPrev}
					>
						Sebelumnya
					</Button>
					<span className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
						Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
					</span>
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => meta && setPage(Math.min(meta.lastPage, page + 1))}
						disabled={!canGoNext}
					>
						Selanjutnya
					</Button>
				</div>
			</div>

			<Dialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => {
					setIsDeleteDialogOpen(open);
					if (!open) setSelectedWorkOrder(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Hapus Work Order</DialogTitle>
						<DialogDescription>
							{selectedWorkOrder
								? `Yakin ingin menghapus work order "${selectedWorkOrder.wo_number}"?`
								: 'Yakin ingin menghapus work order ini?'}
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
							onClick={handleConfirmDelete}
							disabled={deleteMutation.isPending || !selectedWorkOrder}
						>
							{deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
