"use no memo";

import { useMemo, useState, type DragEvent } from 'react';
import { GripVertical, Package, User, Calendar } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';
import { useWorkOrders } from '../work-orders/hooks/useWorkOrders';
import { useUpdateWorkOrderStage } from '../work-orders/hooks/useUpdateWorkOrderStage';
import type { WorkOrder, WorkOrderStage } from '../work-orders/types/workOrder.types';

const stages: { id: WorkOrderStage; title: string; color: string }[] = [
	{ id: 'cutting', title: 'Cutting', color: 'border-blue-500/30 bg-blue-500/5' },
	{ id: 'printing', title: 'Printing/Bordir', color: 'border-amber-500/30 bg-amber-500/5' },
	{ id: 'sewing', title: 'Sewing', color: 'border-amber-500/30 bg-amber-500/5' },
	{ id: 'qc', title: 'QC & Packing', color: 'border-indigo-500/30 bg-indigo-500/5' },
	{ id: 'ready', title: 'Ready', color: 'border-emerald-500/30 bg-emerald-500/5' },
];

const priorityConfig = {
	low: { label: 'Low', variant: 'secondary' as const },
	medium: { label: 'Medium', variant: 'warning' as const },
	high: { label: 'High', variant: 'danger' as const },
};

interface KanbanCardData {
	cardId: string;
	fromColumnId: string;
}

export function TrackingPage() {
	const { data, isLoading, isError } = useWorkOrders({
		page: 1,
		perPage: 100,
		filters: { status: 'in-progress' },
	});
	const updateStageMutation = useUpdateWorkOrderStage();
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

	const workOrders = data?.items ?? [];

	const columns = useMemo(() => {
		return stages.map((stage) => ({
			...stage,
			cards: workOrders.filter((wo) => wo.stage === stage.id),
		}));
	}, [workOrders]);

	const totalCards = workOrders.length;

	const handleDragStart = (e: DragEvent<HTMLDivElement>, cardId: string, fromColumnId: string) => {
		e.dataTransfer.setData('text/plain', JSON.stringify({ cardId, fromColumnId }));
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>, columnId: string) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		setDragOverColumn(columnId);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>, toColumnId: string) => {
		e.preventDefault();
		setDragOverColumn(null);
		try {
			const { cardId, fromColumnId } = JSON.parse(e.dataTransfer.getData('text/plain')) as KanbanCardData;
			if (fromColumnId === toColumnId) return;

			updateStageMutation.mutate({
				id: cardId,
				payload: { stage: toColumnId as WorkOrderStage },
			});
		} catch {
			// ignore invalid drop payloads
		}
	};

	const renderCard = (workOrder: WorkOrder, columnId: string) => {
		const customerName = workOrder.sales_order?.customer?.customer_name ?? '-';
		const productName = workOrder.product?.product_name ?? '-';
		const dueDate = new Date(workOrder.due_date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
		});

		return (
			<Card
				key={workOrder.id}
				draggable
				onDragStart={(e) => handleDragStart(e, workOrder.id, columnId)}
				className="cursor-grab border-border/50 bg-surface-1 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
			>
				<CardContent className="space-y-3 p-4">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							<GripVertical className="h-4 w-4 text-text/50" />
							<span className="font-mono text-sm font-semibold text-accent">{workOrder.wo_number}</span>
						</div>
						<Badge variant={priorityConfig[workOrder.priority].variant}>
							{priorityConfig[workOrder.priority].label}
						</Badge>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm">
							<User className="h-4 w-4 text-text/70" />
							<span className="text-text">{customerName}</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Package className="h-4 w-4 text-text/70" />
							<span className="font-medium text-text-h">{productName}</span>
							<span className="text-text">• {workOrder.quantity} pcs</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Calendar className="h-4 w-4 text-text/70" />
							<span className="text-text">Due: {dueDate}</span>
						</div>
					</div>
					<div className="space-y-2 pt-1">
						<div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
							<div
								className="h-full rounded-full bg-accent transition-all"
								style={{ width: `${workOrder.progress}%` }}
							/>
						</div>
						<div className="flex justify-between text-xs text-text">
							<span>Progress</span>
							<span>{workOrder.progress}%</span>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">Production Tracking</CardTitle>
							<CardDescription>
								Kanban board untuk memantau pengerjaan SPK konveksi per tahap produksi. Drag card antar kolom untuk update tahap.
							</CardDescription>
						</div>
						<Badge variant="default">Production</Badge>
					</div>
				</CardHeader>
			</Card>

			{isError ? (
				<Card>
					<CardContent className="p-6 text-center text-sm text-destructive">
						Gagal memuat data tracking. Silakan coba lagi.
					</CardContent>
				</Card>
			) : null}

			<div className="flex gap-4 overflow-x-auto pb-4">
				{isLoading
					? stages.map((stage) => (
							<div
								key={stage.id}
								className={cn(
									'flex min-w-[300px] flex-col rounded-2xl border-2 p-3',
									stage.color
								)}
							>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="font-semibold text-text-h">{stage.title}</h3>
									<Badge variant="secondary">0</Badge>
								</div>
								<div className="min-h-40 space-y-3">
									<Card className="border-border/50 bg-surface-1">
										<CardContent className="space-y-3 p-4">
											<div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
											<div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
											<div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
											<div className="h-2 w-full animate-pulse rounded-full bg-surface-2" />
										</CardContent>
									</Card>
								</div>
								</div>
							))
					: columns.map((column) => (
							<div
								key={column.id}
								onDragOver={(e) => handleDragOver(e, column.id)}
								onDrop={(e) => handleDrop(e, column.id)}
								onDragLeave={() => setDragOverColumn((cur) => (cur === column.id ? null : cur))}
								className={cn(
									'flex min-w-[300px] flex-col rounded-2xl border-2 p-3 transition-colors',
									column.color,
									dragOverColumn === column.id && 'border-accent/60 bg-accent/5'
								)}
							>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="font-semibold text-text-h">{column.title}</h3>
									<Badge variant="secondary">{column.cards.length}</Badge>
								</div>
								<div className="min-h-40 space-y-3">
									{column.cards.map((card) => renderCard(card, column.id))}
									{column.cards.length === 0 && (
										<div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border/70 text-xs text-text">
											Drop SPK di sini
										</div>
									)}
								</div>
							</div>
						))}
			</div>

			<Card>
				<CardContent className="p-4">
					<p className="text-sm text-text">
						Drag & drop card untuk memindahkan antar tahap. Total orders in progress:{' '}
						<span className="font-semibold text-text-h">{totalCards} orders</span>
						{updateStageMutation.isPending ? ' (updating...)' : null}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
