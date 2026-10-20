import { useState } from 'react';
import { Pencil } from 'lucide-react';
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
import { useUpdateSizeChart } from '../hooks/useUpdateSizeChart';
import type { SizeChart } from '../types/sizeChart.types';
import type { UpdateSizeChartInput } from '../schemas/sizeChart.schema';

interface EditSizeChartDialogProps {
	sizeChart: SizeChart;
	onUpdated?: () => void;
}

export function EditSizeChartDialog({ sizeChart, onUpdated }: EditSizeChartDialogProps) {
	const [open, setOpen] = useState(false);
	const updateMutation = useUpdateSizeChart();

	const handleSubmit = async (values: UpdateSizeChartInput) => {
		await updateMutation.mutateAsync({ id: sizeChart.id, payload: values });
		toast.success('Size chart berhasil diperbarui');
		setOpen(false);
		onUpdated?.();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
					aria-label={`Edit size ${sizeChart.size}`}
				>
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Size Chart</DialogTitle>
					<DialogDescription>
						Perbarui ukuran {sizeChart.size} untuk produk{' '}
						{sizeChart.product?.product_name ?? ''}.
					</DialogDescription>
				</DialogHeader>
				<SizeChartForm
					key={`${sizeChart.id}-${open}`}
					mode="edit"
					initialData={sizeChart}
					onSubmit={handleSubmit}
					onCancel={() => setOpen(false)}
					isSubmitting={updateMutation.isPending}
				/>
			</DialogContent>
		</Dialog>
	);
}
