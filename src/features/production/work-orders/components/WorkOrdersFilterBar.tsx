import { Search, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import type { WorkOrderFilterParams, WorkOrderStage, WorkOrderStatus } from '../types/workOrder.types';

interface WorkOrdersFilterBarProps {
	filters: WorkOrderFilterParams;
	onChange: (filters: WorkOrderFilterParams) => void;
	onReset: () => void;
	isLoading?: boolean;
}

const statusOptions: { value: WorkOrderStatus | ''; label: string }[] = [
	{ value: '', label: 'Semua Status' },
	{ value: 'draft', label: 'Draft' },
	{ value: 'in-progress', label: 'In Progress' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

const stageOptions: { value: WorkOrderStage | ''; label: string }[] = [
	{ value: '', label: 'Semua Stage' },
	{ value: 'cutting', label: 'Cutting' },
	{ value: 'printing', label: 'Printing/Bordir' },
	{ value: 'sewing', label: 'Sewing' },
	{ value: 'qc', label: 'QC & Packing' },
	{ value: 'ready', label: 'Ready' },
];

export function WorkOrdersFilterBar({ filters, onChange, onReset, isLoading }: WorkOrdersFilterBarProps) {
	const handleChange = (key: keyof WorkOrderFilterParams, value: string) => {
		onChange({ ...filters, [key]: value });
	};

	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-2/40 p-4 lg:flex-row lg:items-end">
			<div className="flex-1 space-y-1.5">
				<Label htmlFor="wo-search" className="text-xs text-text">
					Cari SPK
				</Label>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text" />
					<Input
						id="wo-search"
						value={filters.q ?? ''}
						onChange={(e) => handleChange('q', e.target.value)}
						placeholder="Cari nomor SPK..."
						className="h-10 pl-9"
						disabled={isLoading}
					/>
				</div>
			</div>

			<div className="w-full space-y-1.5 lg:w-44">
				<Label htmlFor="wo-status" className="text-xs text-text">
					Status
				</Label>
				<Select
					id="wo-status"
					value={filters.status ?? ''}
					onChange={(e) => handleChange('status', e.target.value)}
					disabled={isLoading}
				>
					{statusOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</Select>
			</div>

			<div className="w-full space-y-1.5 lg:w-44">
				<Label htmlFor="wo-stage" className="text-xs text-text">
					Stage
				</Label>
				<Select
					id="wo-stage"
					value={filters.stage ?? ''}
					onChange={(e) => handleChange('stage', e.target.value)}
					disabled={isLoading}
				>
					{stageOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="h-10 w-10 px-0"
					onClick={onReset}
					disabled={isLoading}
					title="Reset filter"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
