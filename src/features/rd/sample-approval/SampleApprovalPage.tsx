"use no memo";

import { useState } from 'react';
import { CheckCircle2, Clock, Package, Pencil, Search, Trash2, X, XCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../../../components/ui/card';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { AddSampleApprovalDialog } from './components/AddSampleApprovalDialog';
import { EditSampleApprovalDialog } from './components/EditSampleApprovalDialog';
import { useDeleteSampleApproval } from './hooks/useDeleteSampleApproval';
import { useSampleApprovals } from './hooks/useSampleApprovals';
import { useUpdateSampleApprovalStatus } from './hooks/useUpdateSampleApprovalStatus';
import type { SampleApproval, SampleApprovalStatus } from './types/sampleApproval.types';

const statusConfig = {
	pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
	approved: { label: 'Approved', variant: 'success' as const, icon: CheckCircle2 },
	rejected: { label: 'Rejected', variant: 'danger' as const, icon: XCircle },
	revision: { label: 'Revision', variant: 'info' as const, icon: Package },
};

const statusOptions: { value: SampleApprovalStatus | ''; label: string }[] = [
	{ value: '', label: 'Semua Status' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'revision', label: 'Revision' },
];

export function SampleApprovalPage() {
	const [statusFilter, setStatusFilter] = useState<SampleApprovalStatus | ''>('');
	const [searchValue, setSearchValue] = useState('');
	const debouncedSearch = useDebouncedValue(searchValue, 450);
	const { data, isLoading, isError } = useSampleApprovals({
		status: statusFilter || undefined,
		q: debouncedSearch.trim() || undefined,
	});
	const updateStatusMutation = useUpdateSampleApprovalStatus();
	const deleteMutation = useDeleteSampleApproval();

	const samples = data ?? [];

	const [selectedSample, setSelectedSample] = useState<SampleApproval | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

	const handleStatusChange = (sample: SampleApproval, status: 'approved' | 'rejected' | 'revision') => {
		updateStatusMutation.mutate({
			id: sample.id,
			payload: { status, notes: sample.notes ?? '' },
		});
	};

	const handleDelete = (sample: SampleApproval) => {
		setSelectedSample(sample);
		setIsDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!selectedSample) return;
		deleteMutation.mutate(selectedSample.id, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				setSelectedSample(null);
			},
		});
	};

	const handleViewNotes = (sample: SampleApproval) => {
		setSelectedSample(sample);
		setIsNotesDialogOpen(true);
	};

	const handleResetFilters = () => {
		setStatusFilter('');
		setSearchValue('');
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle className="text-2xl">Sample Approval</CardTitle>
							<CardDescription>
								Pencatatan dan verifikasi sampel dari klien sebelum mass production.
							</CardDescription>
						</div>
						<AddSampleApprovalDialog />
					</div>
				</CardHeader>
			</Card>

			<div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-2/40 p-4 lg:flex-row lg:items-end">
				<div className="flex-1 space-y-1.5">
					<Label htmlFor="sample-search" className="text-xs text-text">
						Cari Kode Sample
					</Label>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text" />
						<Input
							id="sample-search"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder="Cari SMP-001..."
							className="h-10 pl-9"
							disabled={isLoading}
						/>
					</div>
				</div>
				<div className="w-full space-y-1.5 lg:w-48">
					<Label htmlFor="status-filter" className="text-xs text-text">
						Status
					</Label>
					<Select
						id="status-filter"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as SampleApprovalStatus | '')}
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
					onClick={handleResetFilters}
					disabled={isLoading || (!statusFilter && !searchValue)}
					title="Reset filter"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{isError ? (
				<Card>
					<CardContent className="p-6 text-center text-sm text-destructive">
						Gagal memuat sample approval. Silakan coba lagi.
					</CardContent>
				</Card>
			) : null}

			<div className="grid gap-4 md:grid-cols-2">
				{isLoading
					? Array.from({ length: 4 }).map((_, index) => (
							<Card key={index}>
								<CardContent className="space-y-3 p-4">
									<div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
									<div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
									<div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
								</CardContent>
							</Card>
						))
					: samples.length === 0 ? (
						<Card className="md:col-span-2">
							<CardContent className="p-6 text-center text-sm text-text">
								Tidak ada sample approval yang sesuai filter.
							</CardContent>
						</Card>
					) : (
						samples.map((sample) => {
							const StatusIcon = statusConfig[sample.status].icon;
							return (
								<Card
									key={sample.id}
									className="transition-colors hover:border-accent/50"
								>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
													<Package className="h-5 w-5" />
												</div>
												<div>
													<CardTitle className="text-base">
														{sample.product?.product_name ?? '-'}
													</CardTitle>
													<CardDescription className="text-xs">
														{sample.sample_code} • {sample.customer?.customer_name ?? '-'}
													</CardDescription>
												</div>
											</div>
											<Badge variant={statusConfig[sample.status].variant} className="gap-1">
												<StatusIcon className="h-3 w-3" />
												{statusConfig[sample.status].label}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex justify-between text-sm">
											<span className="text-text">Submitted</span>
											<span className="font-medium text-text-h">{sample.submitted_date}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-text">Revision Count</span>
											<span className="font-medium text-text-h">{sample.revision_count}x</span>
										</div>
										<p className="rounded-lg bg-surface-2/50 p-3 text-sm text-text">
											{sample.notes || 'Tidak ada catatan.'}
										</p>
										<div className="flex gap-2 pt-2">
											<Button
												type="button"
												variant="secondary"
												size="sm"
												className="flex-1"
												onClick={() => handleViewNotes(sample)}
											>
												<Pencil className="mr-1 h-3 w-3" />
												Catatan
											</Button>
											<EditSampleApprovalDialog sampleApproval={sample} />
											{sample.status === 'pending' ? (
												<>
													<Button
														type="button"
														size="sm"
														className="flex-1 bg-emerald-600 hover:bg-emerald-700"
														onClick={() => handleStatusChange(sample, 'approved')}
														disabled={updateStatusMutation.isPending}
													>
														Approve
													</Button>
													<Button
														type="button"
														size="sm"
														variant="destructive"
														className="flex-1"
														onClick={() => handleStatusChange(sample, 'rejected')}
														disabled={updateStatusMutation.isPending}
													>
														Reject
													</Button>
												</>
											) : null}
											{sample.status !== 'pending' && sample.status !== 'revision' ? (
												<Button
													type="button"
													size="sm"
													variant="secondary"
													className="flex-1"
													onClick={() => handleStatusChange(sample, 'revision')}
													disabled={updateStatusMutation.isPending}
												>
													Revisi
												</Button>
											) : null}
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-8 w-8 px-0 text-destructive"
												onClick={() => handleDelete(sample)}
												disabled={deleteMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})
					)}
			</div>

			<Dialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => {
					setIsDeleteDialogOpen(open);
					if (!open) setSelectedSample(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Hapus Sample Approval</DialogTitle>
						<DialogDescription>
							{selectedSample
								? `Yakin ingin menghapus sample approval "${selectedSample.sample_code}"?`
								: 'Yakin ingin menghapus sample approval ini?'}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="secondary" disabled={deleteMutation.isPending}>
								Batal
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={deleteMutation.isPending || !selectedSample}
						>
							{deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isNotesDialogOpen}
				onOpenChange={(open) => {
					setIsNotesDialogOpen(open);
					if (!open) setSelectedSample(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Catatan Sample Approval</DialogTitle>
						<DialogDescription>
							{selectedSample?.sample_code} - {selectedSample?.product?.product_name}
						</DialogDescription>
					</DialogHeader>
					<div className="rounded-lg bg-surface-2/50 p-4 text-sm text-text">
						{selectedSample?.notes || 'Tidak ada catatan.'}
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Tutup
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
