import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../../../../components/ui/dialog';
import { SizeChartForm } from './SizeChartForm';
import { useCreateSizeChart } from '../hooks/useCreateSizeChart';
import type { CreateSizeChartInput } from '../schemas/sizeChart.schema';

interface AddSizeChartDialogProps {
	onCreated?: () => void;
}

export function AddSizeChartDialog({ onCreated }: AddSizeChartDialogProps) {
	const [open, setOpen] = useState(false);
	const createMutation = useCreateSizeChart();

	const handleSubmit = async (values: CreateSizeChartInput) => {
		await createMutation.mutateAsync(values);
		toast.success('Size chart berhasil dibuat');
		setOpen(false);
		onCreated?.();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" size="sm" className="gap-1.5">
					<Plus className="h-4 w-4" />
					Tambah Size Chart
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Tambah Size Chart</DialogTitle>
					<DialogDescription>Tambahkan ukuran untuk produk yang dipilih.</DialogDescription>
				</DialogHeader>
				<SizeChartForm
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
