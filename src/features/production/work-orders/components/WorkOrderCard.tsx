import { Calendar, GripVertical, Package, Pencil, Trash2, User } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import type { WorkOrder } from '../types/workOrder.types';

interface WorkOrderCardProps {
	workOrder: WorkOrder;
	onEdit?: (workOrder: WorkOrder) => void;
	onDelete?: (workOrder: WorkOrder) => void;
}

const stageConfig = {
	cutting: { label: 'Cutting', variant: 'info' as const },
	printing: { label: 'Printing/Bordir', variant: 'warning' as const },
	sewing: { label: 'Sewing', variant: 'warning' as const },
	qc: { label: 'QC & Packing', variant: 'info' as const },
	ready: { label: 'Ready', variant: 'success' as const },
};

const statusConfig = {
	draft: { label: 'Draft', variant: 'secondary' as const },
	'in-progress': { label: 'In Progress', variant: 'warning' as const },
	completed: { label: 'Completed', variant: 'success' as const },
	cancelled: { label: 'Cancelled', variant: 'danger' as const },
};

const priorityConfig = {
	low: { label: 'Low', variant: 'secondary' as const },
	medium: { label: 'Medium', variant: 'warning' as const },
	high: { label: 'High', variant: 'danger' as const },
};

export function WorkOrderCard({ workOrder, onEdit, onDelete }: WorkOrderCardProps) {
	const customerName = workOrder.sales_order?.customer?.customer_name ?? '-';
	const productName = workOrder.product?.product_name ?? '-';
	const dueDate = new Date(workOrder.due_date).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'short',
	});

	return (
		<Card className="cursor-grab border-border/50 bg-surface-1 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing">
			<CardContent className="space-y-3 p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						<GripVertical className="h-4 w-4 text-text/50" />
						<span className="font-mono text-sm font-semibold text-accent">{workOrder.wo_number}</span>
					</div>
					<Badge variant={priorityConfig[workOrder.priority].variant}>{priorityConfig[workOrder.priority].label}</Badge>
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
					<div className="flex items-center justify-between text-sm">
						<span className="text-text">Stage</span>
						<Badge variant={stageConfig[workOrder.stage].variant}>{stageConfig[workOrder.stage].label}</Badge>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
						<div
							className="h-full rounded-full bg-accent transition-all"
							style={{ width: `${workOrder.progress}%` }}
						/>
					</div>
					<div className="flex items-center justify-between text-xs text-text">
						<span>Progress</span>
						<span>{workOrder.progress}%</span>
					</div>
				</div>

				<div className="flex items-center justify-between pt-2">
					<Badge variant={statusConfig[workOrder.status].variant}>{statusConfig[workOrder.status].label}</Badge>
					<div className="flex items-center gap-1">
						{onEdit ? (
							<Button type="button" variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => onEdit(workOrder)}>
								<Pencil className="h-4 w-4" />
							</Button>
						) : null}
						{onDelete ? (
							<Button type="button" variant="ghost" size="sm" className="h-8 w-8 px-0 text-destructive" onClick={() => onDelete(workOrder)}>
								<Trash2 className="h-4 w-4" />
							</Button>
						) : null}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
