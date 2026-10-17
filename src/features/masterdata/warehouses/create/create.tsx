"use no memo";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../../../../components/ui/button';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import api from '../../../../lib/api';

const createWarehouseSchema = z.object({
	code: z
		.string()
		.trim()
		.min(1, 'Warehouse code is required')
		.max(50, 'Warehouse code must be at most 50 characters'),
	name: z
		.string()
		.trim()
		.min(1, 'Warehouse name is required')
		.max(120, 'Warehouse name must be at most 120 characters'),
	location: z
		.string()
		.trim()
		.min(1, 'Location is required')
		.max(120, 'Location must be at most 120 characters'),
	is_active: z.boolean().default(true),
});

interface WarehouseApiErrorResponse {
	message?: string;
	errors?: {
		code?: string[];
		name?: string[];
		location?: string[];
	};
}

interface WarehouseDetailResponse {
	success?: boolean;
	message?: string;
	data?: {
		id: string | number;
		code: string;
		name: string;
		location: string;
		is_active?: boolean;
	};
}

type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;

export function CreateWarehousesPage() {
	"use no memo";

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [formError, setFormError] = useState<string | null>(null);
	const [isPrefilling, setIsPrefilling] = useState(false);
	const mode = searchParams.get('mode');
	const editId = searchParams.get('id');
	const isEditMode = mode === 'edit' && Boolean(editId);

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<z.input<typeof createWarehouseSchema>, unknown, CreateWarehouseFormValues>({
		resolver: zodResolver(createWarehouseSchema),
		defaultValues: {
			code: '',
			name: '',
			location: '',
			is_active: true,
		},
	});

	const onSubmit = async (values: CreateWarehouseFormValues) => {
		setFormError(null);

		try {
			const response = isEditMode
				? await api.put(
					`/master-data/warehouses/${editId}`,
					values,
					{
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						withCredentials: true,
					}
				)
				: await api.post(
					'/master-data/warehouses',
					values,
					{
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						withCredentials: true,
					}
				);

			const message = (response.data as { message?: string })?.message ?? (isEditMode ? 'Gudang berhasil diperbarui' : 'Gudang berhasil dibuat');
			toast.success(message);
			navigate('/masterdata/warehouses');
		} catch (error) {
			if (axios.isAxiosError<WarehouseApiErrorResponse>(error)) {
				const apiCodeError = error.response?.data?.errors?.code?.[0];
				const apiNameError = error.response?.data?.errors?.name?.[0];
				const apiLocationError = error.response?.data?.errors?.location?.[0];

				if (apiCodeError) {
					setError('code', { type: 'server', message: apiCodeError });
				}

				if (apiNameError) {
					setError('name', { type: 'server', message: apiNameError });
				}

				if (apiLocationError) {
					setError('location', { type: 'server', message: apiLocationError });
				}

				const apiMessage = error.response?.data?.message;
				if (apiMessage) {
					setFormError(apiMessage);
					toast.error(apiMessage);
					return;
				}
			}

			const fallbackMessage = 'Failed to create warehouse. Please try again.';
			setFormError(fallbackMessage);
			toast.error(fallbackMessage);
		}
	};

	useEffect(() => {
		if (!isEditMode || !editId) {
			return;
		}

		let mounted = true;

		const loadWarehouseDetail = async () => {
			setIsPrefilling(true);
			setFormError(null);

			try {
				const response = await api.get<WarehouseDetailResponse>(
					`/master-data/warehouses/${editId}`,
					{
						headers: {
							Accept: 'application/json',
						},
						withCredentials: true,
					}
				);

				const warehouse = response.data?.data;

				if (!mounted) {
					return;
				}

				if (!warehouse) {
					setFormError('Data gudang tidak ditemukan.');
					return;
				}

				reset({
					code: warehouse.code,
					name: warehouse.name,
					location: warehouse.location,
					is_active: warehouse.is_active ?? true,
				});
			} catch {
				if (!mounted) {
					return;
				}

				setFormError('Gagal memuat data gudang untuk edit.');
			} finally {
				if (mounted) {
					setIsPrefilling(false);
				}
			}
		};

		void loadWarehouseDetail();

		return () => {
			mounted = false;
		};
	}, [editId, isEditMode, reset]);

	return (
		<Card>
			<CardHeader>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to="/masterdata">Masterdata</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to="/masterdata/warehouses">Gudang</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{isEditMode ? 'Edit Gudang' : 'Tambah Gudang'}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="space-y-1">
					<CardTitle>{isEditMode ? 'Edit Gudang' : 'Tambah Gudang'}</CardTitle>
					<CardDescription>
						{isEditMode
							? 'Perbarui data gudang.'
							: 'Tambah gudang baru.'}
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent>
				{isPrefilling && (
					<p className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
						Memuat data gudang...
					</p>
				)}
				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="warehouse-code">Kode Gudang</Label>
							<Input
								id="warehouse-code"
								{...register('code')}
								placeholder="Masukkan kode gudang (contoh: WH-001)"
								autoFocus
							/>
							{errors.code?.message && <p className="text-sm text-rose-400">{errors.code.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="warehouse-name">Nama Gudang</Label>
							<Input
								id="warehouse-name"
								{...register('name')}
								placeholder="Masukkan nama gudang"
							/>
							{errors.name?.message && <p className="text-sm text-rose-400">{errors.name.message}</p>}
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="warehouse-location">Lokasi</Label>
							<Input
								id="warehouse-location"
								{...register('location')}
								placeholder="Masukkan lokasi gudang"
							/>
							{errors.location?.message && <p className="text-sm text-rose-400">{errors.location.message}</p>}
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="warehouse-active">Status</Label>
							<label htmlFor="warehouse-active" className="flex items-center gap-2 text-sm text-text-h">
								<input
									id="warehouse-active"
									type="checkbox"
									{...register('is_active')}
									className="h-4 w-4 rounded border border-border accent-accent"
								/>
								<span>Aktif</span>
							</label>
						</div>
					</div>

					{formError && (
						<p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{formError}</p>
					)}

					<div className="flex items-center justify-end gap-2">
						<Button type="button" variant="secondary" onClick={() => navigate('/masterdata/warehouses')}>
							Batal
						</Button>
						<Button type="submit" disabled={isSubmitting || isPrefilling}>
							{isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan'}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
