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
import { SampleApprovalForm } from './SampleApprovalForm';
import { useCreateSampleApproval } from '../hooks/useCreateSampleApproval';
import type { CreateSampleApprovalInput } from '../schemas/sampleApproval.schema';

export function AddSampleApprovalDialog() {
	const [open, setOpen] = useState(false);
	const createMutation = useCreateSampleApproval();

	const handleSubmit = (payload: CreateSampleApprovalInput | { [key: string]: unknown }) => {
		createMutation.mutate(payload as CreateSampleApprovalInput, {
			onSuccess: () => setOpen(false),
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="h-4 w-4" />
					Buat Sample Approval
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Buat Sample Approval</DialogTitle>
					<DialogDescription>Isi detail sample approval baru di bawah ini.</DialogDescription>
				</DialogHeader>
				<SampleApprovalForm
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
