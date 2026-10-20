import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder';
import type { CreateWorkOrderInput } from '../schemas/workOrder.schema';

export function AddWorkOrderDialog() {
	const [open, setOpen] = useState(false);
	const createMutation = useCreateWorkOrder();

	const handleSubmit = (payload: CreateWorkOrderInput | { [key: string]: unknown }) => {
		createMutation.mutate(payload as CreateWorkOrderInput, {
			onSuccess: () => setOpen(false),
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="h-4 w-4" />
					Buat SPK
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Buat Work Order / SPK</DialogTitle>
					<DialogDescription>Isi detail SPK baru di bawah ini.</DialogDescription>
				</DialogHeader>
				<WorkOrderForm
					key={`add-${open}`}
					mode="create"
					onSubmit={handleSubmit}
					onCancel={() => setOpen(false)}
					isSubmitting={createMutation.isPending}
				/>
			</DialogContent>
		</Dialog>
	);
}
