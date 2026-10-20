import { useState } from 'react';
import { AlertCircle, CheckCircle2, Package, X } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Progress } from '../../../components/ui/progress';
import { Select } from '../../../components/ui/select';
import { useMaterialChecklist } from './hooks/useMaterialChecklist';
import type { MaterialChecklistStatus } from './types/materialChecklist.types';

const statusConfig = {
	sufficient: { label: 'Cukup', variant: 'success' as const, icon: CheckCircle2 },
	shortage: { label: 'Kurang', variant: 'danger' as const, icon: AlertCircle },
	pending: { label: 'Pending', variant: 'warning' as const, icon: Package },
};

const statusOptions: { value: MaterialChecklistStatus | ''; label: string }[] = [
	{ value: '', label: 'Semua Status' },
	{ value: 'sufficient', label: 'Cukup' },
	{ value: 'shortage', label: 'Kurang' },
	{ value: 'pending', label: 'Pending' },
];

export function MaterialChecklistPage() {
	const [statusFilter, setStatusFilter] = useState<MaterialChecklistStatus | ''>('');
	const { data, isLoading, isError } = useMaterialChecklist({
		status: statusFilter || undefined,
	});

	const materialChecks = data ?? [];
	const shortageCount = materialChecks.filter((m) => m.status === 'shortage').length;

	const handleResetFilter = () => setStatusFilter('');

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle className="text-2xl">Material Checklist</CardTitle>
							<CardDescription>
								Perhitungan kebutuhan kain vs stok yang dibeli untuk setiap Work Order.
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="default">Production</Badge>
							{shortageCount > 0 ? <Badge variant="danger">{shortageCount} Shortage</Badge> : null}
						</div>
					</div>
				</CardHeader>
			</Card>

			<div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-2/40 p-4 sm:flex-row sm:items-end">
				<div className="w-full space-y-1.5 sm:w-56">
					<Label htmlFor="status-filter" className="text-xs text-text">
						Filter Status
					</Label>
					<Select
						id="status-filter"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as MaterialChecklistStatus | '')}
						disabled={isLoading}
					>
						{statusOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
				</div>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="h-10 w-10 px-0"
					onClick={handleResetFilter}
					disabled={isLoading || !statusFilter}
					title="Reset filter"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{isError ? (
				<Card>
					<CardContent className="p-6 text-center text-sm text-destructive">
						Gagal memuat Material Checklist. Silakan coba lagi.
					</CardContent>
				</Card>
			) : null}

			<div className="grid gap-4">
				{isLoading ? (
					Array.from({ length: 4 }).map((_, index) => (
						<Card key={index}>
							<CardContent className="space-y-3 p-4">
								<div className="h-4 w-1/4 animate-pulse rounded bg-surface-2" />
								<div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
								<div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
							</CardContent>
						</Card>
					))
				) : materialChecks.length === 0 ? (
					<Card>
						<CardContent className="p-6 text-center text-sm text-text">
							Tidak ada material checklist yang sesuai filter.
						</CardContent>
					</Card>
				) : (
					materialChecks.map((check) => {
						const StatusIcon = statusConfig[check.status].icon;
						const percentage = Math.min((check.purchased / check.required) * 100, 100);
						const shortage = check.required - check.purchased;

						return (
							<Card key={check.id} className={check.status === 'shortage' ? 'border-rose-500/30' : ''}>
								<CardContent className="p-4">
									<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-3">
												<span className="font-mono text-sm font-semibold text-accent">
													{check.work_order.wo_number}
												</span>
												<Badge variant={statusConfig[check.status].variant} className="gap-1">
													<StatusIcon className="h-3 w-3" />
													{statusConfig[check.status].label}
												</Badge>
											</div>
											<div>
												<p className="font-medium text-text-h">{check.product.product_name}</p>
												<p className="text-sm text-text">{check.material}</p>
											</div>
										</div>

										<div className="grid grid-cols-3 gap-4 text-center lg:w-80">
											<div>
												<p className="text-xs text-text">Dibutuhkan</p>
												<p className="text-sm font-semibold text-text-h">
													{check.required} {check.unit}
												</p>
											</div>
											<div>
												<p className="text-xs text-text">Sudah Dibeli</p>
												<p className="text-sm font-semibold text-text-h">
													{check.purchased} {check.unit}
												</p>
											</div>
											<div>
												<p className="text-xs text-text">Sisa</p>
												<p
													className={`text-sm font-semibold ${
														shortage > 0 ? 'text-rose-400' : 'text-emerald-400'
													}`}
												>
													{shortage > 0 ? `-${shortage}` : `+${check.purchased - check.required}`}{' '}
													{check.unit}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-4 lg:w-64">
											<div className="flex-1">
												<Progress value={percentage} className="h-2" />
												<p className="mt-1 text-xs text-text">{percentage.toFixed(0)}% tercukupi</p>
											</div>
											{check.status === 'shortage' ? (
												<Button size="sm" variant="default" className="shrink-0">
													Order PO
												</Button>
											) : null}
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
			</div>
		</div>
	);
}
