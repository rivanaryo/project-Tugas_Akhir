"use no memo";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import {
	createWorkOrderInputSchema,
	updateWorkOrderInputSchema,
	type CreateWorkOrderInput,
	type UpdateWorkOrderInput,
} from '../schemas/workOrder.schema';
import type { WorkOrder } from '../types/workOrder.types';
import { ProductPickerDialog } from '../../../masterdata/size-charts/components/ProductPickerDialog';
import type { Product } from '../../../masterdata/items/types/product.types';
import { SalesOrderPickerDialog } from './SalesOrderPickerDialog';
import { TechPackPickerDialog } from './TechPackPickerDialog';
import { useProducts } from '../../../masterdata/items/hooks/useProducts';
import { techPackService } from '../../../rd/tech-pack/techPack.service';
import { useQuery } from '@tanstack/react-query';

interface WorkOrderFormProps {
	mode: 'create' | 'edit';
	initialData?: WorkOrder | null;
	onSubmit: (payload: CreateWorkOrderInput | UpdateWorkOrderInput) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
}

const stageOptions = [
	{ value: 'cutting', label: 'Cutting' },
	{ value: 'printing', label: 'Printing/Bordir' },
	{ value: 'sewing', label: 'Sewing' },
	{ value: 'qc', label: 'QC & Packing' },
	{ value: 'ready', label: 'Ready' },
];

const statusOptions = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'in-progress', label: 'In Progress' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
	{ value: 'low', label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high', label: 'High' },
];

const today = new Date().toISOString().split('T')[0];

export function WorkOrderForm({ mode, initialData, onSubmit, onCancel, isSubmitting }: WorkOrderFormProps) {
	const schema = mode === 'create' ? createWorkOrderInputSchema : updateWorkOrderInputSchema;
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<CreateWorkOrderInput | UpdateWorkOrderInput>({
		resolver: zodResolver(schema),
		defaultValues: {
			wo_number: '',
			sales_order_id: '',
			product_id: '',
			tech_pack_id: null,
			quantity: 1,
			stage: 'cutting',
			status: 'draft',
			priority: 'medium',
			start_date: today,
			due_date: today,
		},
	});

	const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [isTechPackModalOpen, setIsTechPackModalOpen] = useState(false);
	const [selectedSalesOrderDisplay, setSelectedSalesOrderDisplay] = useState<string | null>(null);
	const [selectedProductDisplay, setSelectedProductDisplay] = useState<string | null>(null);
	const [selectedTechPackDisplay, setSelectedTechPackDisplay] = useState<string | null>(null);

	const { data: productsData } = useProducts({ page: 1, perPage: 100 });
	const { data: techPacks } = useQuery({
		queryKey: ['rd', 'tech-packs', 'list'],
		queryFn: () => techPackService.list(),
		staleTime: 60_000,
		gcTime: 5 * 60_000,
	});

	const products = useMemo(() => productsData?.items ?? [], [productsData?.items]);

	const selectedProductId = watch('product_id');
	const selectedTechPackId = watch('tech_pack_id');

	useEffect(() => {
		if (mode === 'edit' && initialData) {
			reset({
				wo_number: initialData.wo_number,
				sales_order_id: initialData.sales_order_id,
				product_id: initialData.product_id,
				tech_pack_id: initialData.tech_pack_id ?? null,
				quantity: initialData.quantity,
				stage: initialData.stage,
				status: initialData.status,
				priority: initialData.priority,
				start_date: initialData.start_date,
				due_date: initialData.due_date,
			});

			setSelectedSalesOrderDisplay(initialData.sales_order?.order_number ?? null);
			setSelectedProductDisplay(initialData.product?.product_name ?? null);
			setSelectedTechPackDisplay(initialData.tech_pack?.name ?? null);
		}
	}, [initialData, mode, reset]);

	useEffect(() => {
		if (selectedProductId && products.length > 0) {
			const product = products.find((p) => String(p.id) === String(selectedProductId));
			if (product) setSelectedProductDisplay(product.product_name);
		}
	}, [selectedProductId, products]);

	useEffect(() => {
		if (selectedTechPackId && techPacks) {
			const techPack = techPacks.find((tp) => tp.id === selectedTechPackId);
			if (techPack) setSelectedTechPackDisplay(techPack.name);
		} else if (!selectedTechPackId) {
			setSelectedTechPackDisplay(null);
		}
	}, [selectedTechPackId, techPacks]);

	useEffect(() => {
		if (mode === 'create' && selectedProductId && selectedTechPackId) {
			const techPack = techPacks?.find((tp) => tp.id === selectedTechPackId);
			if (techPack && techPack.product_id !== selectedProductId) {
				setValue('tech_pack_id', null);
				setSelectedTechPackDisplay(null);
			}
		}
	}, [selectedProductId, selectedTechPackId, techPacks, mode, setValue]);

	const handleSelectSalesOrder = (salesOrder: { id: string | number; order_number: string }) => {
		setValue('sales_order_id', String(salesOrder.id), { shouldValidate: true, shouldDirty: true });
		setSelectedSalesOrderDisplay(salesOrder.order_number);
		setIsSalesOrderModalOpen(false);
	};

	const handleSelectProduct = (product: Product) => {
		setValue('product_id', String(product.id), { shouldValidate: true, shouldDirty: true });
		setSelectedProductDisplay(product.product_name);
		setIsProductModalOpen(false);
	};

	const handleSelectTechPack = (techPack: { id: string; name: string }) => {
		setValue('tech_pack_id', techPack.id, { shouldValidate: true, shouldDirty: true });
		setSelectedTechPackDisplay(techPack.name);
		setIsTechPackModalOpen(false);
	};

	const handleClearTechPack = () => {
		setValue('tech_pack_id', null, { shouldValidate: true, shouldDirty: true });
		setSelectedTechPackDisplay(null);
	};

	const handleFormSubmit = (data: CreateWorkOrderInput | UpdateWorkOrderInput) => {
		onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="wo_number">Nomor SPK</Label>
					<Input id="wo_number" placeholder="SPK-2026-001" {...register('wo_number')} />
					{errors.wo_number?.message ? <p className="text-sm text-destructive">{errors.wo_number.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label>Sales Order</Label>
					<div className="flex gap-2">
						<Input value={selectedSalesOrderDisplay ?? 'Belum dipilih'} readOnly />
						<Button type="button" onClick={() => setIsSalesOrderModalOpen(true)}>
							Pilih
						</Button>
					</div>
					<input type="hidden" {...register('sales_order_id')} />
					{errors.sales_order_id?.message ? <p className="text-sm text-destructive">{errors.sales_order_id.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label>Produk</Label>
					<div className="flex gap-2">
						<Input value={selectedProductDisplay ?? 'Belum dipilih'} readOnly />
						<Button type="button" onClick={() => setIsProductModalOpen(true)}>
							Pilih
						</Button>
					</div>
					<input type="hidden" {...register('product_id')} />
					{errors.product_id?.message ? <p className="text-sm text-destructive">{errors.product_id.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label>Tech Pack (opsional)</Label>
					<div className="flex gap-2">
						<Input value={selectedTechPackDisplay ?? 'Belum dipilih'} readOnly />
						<Button type="button" onClick={() => setIsTechPackModalOpen(true)}>
							Pilih
						</Button>
						{selectedTechPackDisplay ? (
							<Button type="button" variant="secondary" onClick={handleClearTechPack}>
								Hapus
							</Button>
						) : null}
					</div>
					<input type="hidden" {...register('tech_pack_id')} />
					{errors.tech_pack_id?.message ? <p className="text-sm text-destructive">{errors.tech_pack_id.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="quantity">Quantity</Label>
					<Input id="quantity" type="number" min={1} {...register('quantity', { valueAsNumber: true })} />
					{errors.quantity?.message ? <p className="text-sm text-destructive">{errors.quantity.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="priority">Priority</Label>
					<Select id="priority" {...register('priority')}>
						{priorityOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
					{errors.priority?.message ? <p className="text-sm text-destructive">{errors.priority.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="stage">Stage</Label>
					<Select id="stage" {...register('stage')}>
						{stageOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
					{errors.stage?.message ? <p className="text-sm text-destructive">{errors.stage.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="status">Status</Label>
					<Select id="status" {...register('status')}>
						{statusOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
					{errors.status?.message ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="start_date">Tanggal Mulai</Label>
					<Input id="start_date" type="date" {...register('start_date')} />
					{errors.start_date?.message ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="due_date">Tanggal Selesai</Label>
					<Input id="due_date" type="date" {...register('due_date')} />
					{errors.due_date?.message ? <p className="text-sm text-destructive">{errors.due_date.message}</p> : null}
				</div>
			</div>

			<div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
					Batal
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Buat Work Order' : 'Simpan Perubahan'}
				</Button>
			</div>

			<SalesOrderPickerDialog
				open={isSalesOrderModalOpen}
				onOpenChange={setIsSalesOrderModalOpen}
				onSelect={handleSelectSalesOrder}
			/>
			<ProductPickerDialog
				open={isProductModalOpen}
				onOpenChange={setIsProductModalOpen}
				onSelect={handleSelectProduct}
			/>
			<TechPackPickerDialog
				open={isTechPackModalOpen}
				onOpenChange={setIsTechPackModalOpen}
				onSelect={handleSelectTechPack}
				productId={selectedProductId}
			/>
		</form>
	);
}
