import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../../../../components/ui/dialog';
import { WorkOrderForm } from './WorkOrderForm';
import { useUpdateWorkOrder } from '../hooks/useUpdateWorkOrder';
import type { WorkOrder } from '../types/workOrder.types';
import type { UpdateWorkOrderInput } from '../schemas/workOrder.schema';

interface EditWorkOrderDialogProps {
	workOrder: WorkOrder;
}

export function EditWorkOrderDialog({ workOrder }: EditWorkOrderDialogProps) {
	const [open, setOpen] = useState(false);
	const updateMutation = useUpdateWorkOrder();

	const handleSubmit = (payload: UpdateWorkOrderInput) => {
		updateMutation.mutate(
			{ id: workOrder.id, payload },
			{
				onSuccess: () => setOpen(false),
			}
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="ghost" size="sm" className="h-8 w-8 px-0">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Work Order / SPK</DialogTitle>
					<DialogDescription>Edit detail SPK {workOrder.wo_number} di bawah ini.</DialogDescription>
				</DialogHeader>
				<WorkOrderForm
					key={`${workOrder.id}-${open}`}
					mode="edit"
					initialData={workOrder}
					onSubmit={handleSubmit}
					onCancel={() => setOpen(false)}
					isSubmitting={updateMutation.isPending}
				/>
			</DialogContent>
		</Dialog>
	);
}
