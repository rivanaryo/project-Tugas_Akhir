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
import { SampleApprovalForm } from './SampleApprovalForm';
import { useUpdateSampleApproval } from '../hooks/useUpdateSampleApproval';
import type { SampleApproval } from '../types/sampleApproval.types';
import type { UpdateSampleApprovalInput } from '../schemas/sampleApproval.schema';

interface EditSampleApprovalDialogProps {
	sampleApproval: SampleApproval;
}

export function EditSampleApprovalDialog({ sampleApproval }: EditSampleApprovalDialogProps) {
	const [open, setOpen] = useState(false);
	const updateMutation = useUpdateSampleApproval();

	const handleSubmit = (payload: UpdateSampleApprovalInput) => {
		updateMutation.mutate(
			{ id: sampleApproval.id, payload },
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
					<DialogTitle>Edit Sample Approval</DialogTitle>
					<DialogDescription>
						Edit detail sample approval {sampleApproval.sample_code} di bawah ini.
					</DialogDescription>
				</DialogHeader>
				<SampleApprovalForm
					key={`${sampleApproval.id}-${open}`}
					mode="edit"
					initialData={sampleApproval}
					onSubmit={handleSubmit}
					onCancel={() => setOpen(false)}
					isSubmitting={updateMutation.isPending}
				/>
			</DialogContent>
		</Dialog>
	);
}
