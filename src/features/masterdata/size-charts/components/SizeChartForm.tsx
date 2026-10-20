"use no memo";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { ProductPickerDialog } from './ProductPickerDialog';
import { createSizeChartInputSchema } from '../schemas/sizeChart.schema';
import type { Product } from '../../items/types/product.types';
import type { SizeChart } from '../types/sizeChart.types';

type FormInput = z.input<typeof createSizeChartInputSchema>;
type FormValues = z.output<typeof createSizeChartInputSchema>;

interface SizeChartApiErrorResponse {
	message?: string;
	errors?: {
		product_id?: string[];
		size?: string[];
		chest_width?: string[];
		body_length?: string[];
		sleeve_length?: string[];
		shoulder_width?: string[];
	};
}

interface SizeChartFormProps {
	initialData?: SizeChart | null;
	onSubmit: (values: FormValues) => Promise<void>;
	onCancel: () => void;
	isSubmitting: boolean;
	mode: 'create' | 'edit';
}

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export function SizeChartForm({ initialData, onSubmit, onCancel, isSubmitting, mode }: SizeChartFormProps) {
	"use no memo";

	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		setError,
		clearErrors,
		reset,
		formState: { errors },
	} = useForm<FormInput, unknown, FormValues>({
		resolver: zodResolver(createSizeChartInputSchema),
		defaultValues: {
			product_id: '',
			size: 'M',
			chest_width: '',
			body_length: '',
			sleeve_length: '',
			shoulder_width: '',
		},
	});

	const displayProduct = useMemo(() => {
		if (selectedProduct) return selectedProduct;
		if (initialData?.product) {
			return {
				id: initialData.product.id,
				product_name: initialData.product.product_name,
			} as Product;
		}
		return null;
	}, [selectedProduct, initialData]);

	useEffect(() => {
		if (!initialData) {
			return;
		}

		reset({
			product_id: initialData.product_id,
			size: initialData.size,
			chest_width: initialData.chest_width ?? '',
			body_length: initialData.body_length ?? '',
			sleeve_length: initialData.sleeve_length ?? '',
			shoulder_width: initialData.shoulder_width ?? '',
		});
	}, [initialData, reset]);

	const handleSelectProduct = (product: Product) => {
		setSelectedProduct(product);
		setValue('product_id', String(product.id), { shouldValidate: true, shouldDirty: true });
		clearErrors('product_id');
		setIsProductModalOpen(false);
	};

	const handleFormSubmit = async (values: FormValues) => {
		setFormError(null);

		try {
			await onSubmit(values);
		} catch (error) {
			if (axios.isAxiosError<SizeChartApiErrorResponse>(error)) {
				const apiErrors = error.response?.data?.errors;
				const apiMessage = error.response?.data?.message;

				if (apiErrors?.product_id?.[0]) {
					setError('product_id', { type: 'server', message: apiErrors.product_id[0] });
				}
				if (apiErrors?.size?.[0]) {
					setError('size', { type: 'server', message: apiErrors.size[0] });
				}
				if (apiErrors?.chest_width?.[0]) {
					setError('chest_width', { type: 'server', message: apiErrors.chest_width[0] });
				}
				if (apiErrors?.body_length?.[0]) {
					setError('body_length', { type: 'server', message: apiErrors.body_length[0] });
				}
				if (apiErrors?.sleeve_length?.[0]) {
					setError('sleeve_length', { type: 'server', message: apiErrors.sleeve_length[0] });
				}
				if (apiErrors?.shoulder_width?.[0]) {
					setError('shoulder_width', { type: 'server', message: apiErrors.shoulder_width[0] });
				}

				if (apiMessage) {
					setFormError(apiMessage);
					return;
				}
			}

			setFormError(mode === 'create' ? 'Gagal membuat size chart.' : 'Gagal memperbarui size chart.');
		}
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
			<div className="space-y-2">
				<Label>Produk</Label>
				<div className="flex gap-2">
					<Input
						value={displayProduct ? displayProduct.product_name : ''}
						placeholder="Pilih produk"
						readOnly
					/>
					<Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(true)}>
						Pilih
					</Button>
				</div>
				<input type="hidden" {...register('product_id')} />
				{errors.product_id?.message && (
					<p className="text-sm text-rose-400">{errors.product_id.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="size">Ukuran</Label>
				<Select id="size" {...register('size')}>
					{SIZE_OPTIONS.map((size) => (
						<option key={size} value={size}>
							{size}
						</option>
					))}
				</Select>
				{errors.size?.message && <p className="text-sm text-rose-400">{errors.size.message}</p>}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="chest_width">Lebar Dada (cm)</Label>
					<Input
						id="chest_width"
						type="number"
						min="0"
						step="0.01"
						{...register('chest_width')}
						placeholder="Contoh: 52"
					/>
					{errors.chest_width?.message && (
						<p className="text-sm text-rose-400">{errors.chest_width.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="body_length">Panjang Baju (cm)</Label>
					<Input
						id="body_length"
						type="number"
						min="0"
						step="0.01"
						{...register('body_length')}
						placeholder="Contoh: 70"
					/>
					{errors.body_length?.message && (
						<p className="text-sm text-rose-400">{errors.body_length.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="sleeve_length">Panjang Lengan (cm)</Label>
					<Input
						id="sleeve_length"
						type="number"
						min="0"
						step="0.01"
						{...register('sleeve_length')}
						placeholder="Contoh: 60"
					/>
					{errors.sleeve_length?.message && (
						<p className="text-sm text-rose-400">{errors.sleeve_length.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="shoulder_width">Lebar Bahu (cm)</Label>
					<Input
						id="shoulder_width"
						type="number"
						min="0"
						step="0.01"
						{...register('shoulder_width')}
						placeholder="Contoh: 42"
					/>
					{errors.shoulder_width?.message && (
						<p className="text-sm text-rose-400">{errors.shoulder_width.message}</p>
					)}
				</div>
			</div>

			{formError && (
				<p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
					{formError}
				</p>
			)}

			<div className="flex justify-end gap-2">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
					Batal
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Simpan Perubahan'}
				</Button>
			</div>

			<ProductPickerDialog
				open={isProductModalOpen}
				onOpenChange={setIsProductModalOpen}
				onSelect={handleSelectProduct}
			/>
		</form>
	);
}
