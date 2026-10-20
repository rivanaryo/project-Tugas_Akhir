"use no memo";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { ProductPickerDialog } from '../../../masterdata/size-charts/components/ProductPickerDialog';
import { SalesOrderPickerDialog } from '../../../production/work-orders/components/SalesOrderPickerDialog';
import type { Product } from '../../../masterdata/items/types/product.types';
import { CustomerPickerDialog } from './CustomerPickerDialog';
import type { SampleApproval } from '../types/sampleApproval.types';
import {
	createSampleApprovalInputSchema,
	updateSampleApprovalInputSchema,
	type CreateSampleApprovalInput,
	type UpdateSampleApprovalInput,
} from '../schemas/sampleApproval.schema';

interface SampleApprovalFormProps {
	mode: 'create' | 'edit';
	initialData?: SampleApproval | null;
	onSubmit: (payload: CreateSampleApprovalInput | UpdateSampleApprovalInput) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
}

const statusOptions = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'revision', label: 'Revision' },
];

const today = new Date().toISOString().split('T')[0];

export function SampleApprovalForm({
	mode,
	initialData,
	onSubmit,
	onCancel,
	isSubmitting,
}: SampleApprovalFormProps) {
	const schema = mode === 'create' ? createSampleApprovalInputSchema : updateSampleApprovalInputSchema;
	const defaultValues =
		mode === 'edit' && initialData
			? {
					sample_code: initialData.sample_code,
					product_id: initialData.product_id,
					customer_id: initialData.customer_id,
					sales_order_id: initialData.sales_order_id ?? null,
					submitted_date: initialData.submitted_date,
					status: initialData.status,
					notes: initialData.notes ?? '',
					revision_count: initialData.revision_count,
				}
			: {
					sample_code: '',
					product_id: '',
					customer_id: '',
					sales_order_id: null,
					submitted_date: today,
					status: 'pending' as const,
					notes: '',
					revision_count: 0,
				};

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateSampleApprovalInput | UpdateSampleApprovalInput>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
	const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
	const [selectedProductDisplay, setSelectedProductDisplay] = useState<string | null>(() =>
		mode === 'edit' && initialData ? initialData.product?.product_name ?? null : null
	);
	const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState<string | null>(() =>
		mode === 'edit' && initialData ? initialData.customer?.customer_name ?? null : null
	);
	const [selectedSalesOrderDisplay, setSelectedSalesOrderDisplay] = useState<string | null>(() =>
		mode === 'edit' && initialData ? initialData.sales_order?.order_number ?? null : null
	);

	const handleSelectProduct = (product: Product) => {
		setValue('product_id', String(product.id), { shouldValidate: true, shouldDirty: true });
		setSelectedProductDisplay(product.product_name);
		setIsProductModalOpen(false);
	};

	const handleSelectCustomer = (customer: { id: string | number; customer_name: string }) => {
		setValue('customer_id', String(customer.id), { shouldValidate: true, shouldDirty: true });
		setSelectedCustomerDisplay(customer.customer_name);
		setIsCustomerModalOpen(false);
	};

	const handleSelectSalesOrder = (salesOrder: { id: string | number; order_number: string }) => {
		setValue('sales_order_id', String(salesOrder.id), { shouldValidate: true, shouldDirty: true });
		setSelectedSalesOrderDisplay(salesOrder.order_number);
		setIsSalesOrderModalOpen(false);
	};

	const handleClearSalesOrder = () => {
		setValue('sales_order_id', null, { shouldValidate: true, shouldDirty: true });
		setSelectedSalesOrderDisplay(null);
	};

	const handleFormSubmit = (data: CreateSampleApprovalInput | UpdateSampleApprovalInput) => {
		onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="sample_code">Kode Sample</Label>
					<Input id="sample_code" placeholder="SMP-001" {...register('sample_code')} />
					{errors.sample_code?.message ? <p className="text-sm text-destructive">{errors.sample_code.message}</p> : null}
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
					<Label>Customer</Label>
					<div className="flex gap-2">
						<Input value={selectedCustomerDisplay ?? 'Belum dipilih'} readOnly />
						<Button type="button" onClick={() => setIsCustomerModalOpen(true)}>
							Pilih
						</Button>
					</div>
					<input type="hidden" {...register('customer_id')} />
					{errors.customer_id?.message ? <p className="text-sm text-destructive">{errors.customer_id.message}</p> : null}
				</div>

				<div className="space-y-2 sm:col-span-2">
					<Label>Sales Order (opsional)</Label>
					<div className="flex gap-2">
						<Input value={selectedSalesOrderDisplay ?? 'Belum dipilih'} readOnly />
						<Button type="button" onClick={() => setIsSalesOrderModalOpen(true)}>
							Pilih
						</Button>
						{selectedSalesOrderDisplay ? (
							<Button type="button" variant="secondary" onClick={handleClearSalesOrder}>
								Hapus
							</Button>
						) : null}
					</div>
					<input type="hidden" {...register('sales_order_id')} />
					{errors.sales_order_id?.message ? <p className="text-sm text-destructive">{errors.sales_order_id.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="submitted_date">Tanggal Submit</Label>
					<Input id="submitted_date" type="date" {...register('submitted_date')} />
					{errors.submitted_date?.message ? <p className="text-sm text-destructive">{errors.submitted_date.message}</p> : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="revision_count">Jumlah Revisi</Label>
					<Input id="revision_count" type="number" min={0} {...register('revision_count', { valueAsNumber: true })} />
					{errors.revision_count?.message ? <p className="text-sm text-destructive">{errors.revision_count.message}</p> : null}
				</div>

				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="notes">Catatan</Label>
					<textarea
						id="notes"
						rows={3}
						className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface-1 px-3 py-2 text-sm text-text-h outline-none transition-all placeholder:text-text/70 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
						{...register('notes')}
					/>
					{errors.notes?.message ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
				</div>
			</div>

			<div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
					Batal
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Buat Sample Approval' : 'Simpan Perubahan'}
				</Button>
			</div>

			<ProductPickerDialog
				open={isProductModalOpen}
				onOpenChange={setIsProductModalOpen}
				onSelect={handleSelectProduct}
			/>
			<CustomerPickerDialog
				open={isCustomerModalOpen}
				onOpenChange={setIsCustomerModalOpen}
				onSelect={handleSelectCustomer}
			/>
			<SalesOrderPickerDialog
				open={isSalesOrderModalOpen}
				onOpenChange={setIsSalesOrderModalOpen}
				onSelect={handleSelectSalesOrder}
			/>
		</form>
	);
}
