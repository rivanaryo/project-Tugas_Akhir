"use no memo";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useReferenceTableFilters } from '../../hooks/useReferenceTableFilters';
import { env } from '../../../../config/env';
import { useCategories } from '../../categories/hooks/useCategories';
import type { Category } from '../../categories/types/category.types';
import { useUnits } from '../../units/hooks/useUnits';
import type { Unit } from '../../units/types/unit.types';

const createItemSchema = z.object({
	product_name: z
		.string()
		.trim()
		.min(1, 'Product name is required')
		.max(120, 'Product name must be at most 120 characters'),
	category_id: z.string().min(1, 'Category is required'),
	unit_id: z.string().min(1, 'Unit is required'),
	is_active: z.boolean().default(true),
	stock_level: z.number().optional(),
	min_stock_level: z.number().optional(),
});

interface ItemApiErrorResponse {
	message?: string;
	errors?: {
		product_name?: string[];
		category_id?: string[];
		unit_id?: string[];
		stock_level?: string[];
		min_stock_level?: string[];
	};
}

interface ProductDetailResponse {
	success?: boolean;
	message?: string;
	data?: {
		id: string | number;
		product_name: string;
		category_id: string | number;
		unit_id: string | number;
		is_active?: boolean;
		stock_level?: number;
		min_stock_level?: number;
	};
}

type CreateItemFormValues = z.infer<typeof createItemSchema>;

export function CreateItemsPage() {
	"use no memo";

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [formError, setFormError] = useState<string | null>(null);
	const [isPrefilling, setIsPrefilling] = useState(false);
	const [selectedCategoryRef, setSelectedCategoryRef] = useState<Category | null>(null);
	const [selectedUnitRef, setSelectedUnitRef] = useState<Unit | null>(null);

	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
	const categoryFilters = useReferenceTableFilters(10);
	const unitFilters = useReferenceTableFilters(10);
	const mode = searchParams.get('mode');
	const editId = searchParams.get('id');
	const isEditMode = mode === 'edit' && Boolean(editId);

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		setError,
		clearErrors,
		control,
		formState: { errors, isSubmitting },
	} = useForm<z.input<typeof createItemSchema>, unknown, CreateItemFormValues>({
		resolver: zodResolver(createItemSchema),
		defaultValues: {
			product_name: '',
			category_id: '',
			unit_id: '',
			is_active: true,
			stock_level: undefined,
			min_stock_level: undefined,
		},
	});

	const categoryId = useWatch({ control, name: 'category_id', defaultValue: '' });
	const unitId = useWatch({ control, name: 'unit_id', defaultValue: '' });
	const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

	const { data: categoriesData, isLoading: isCategoriesLoading, isFetching: isCategoriesFetching } = useCategories({
		page: categoryFilters.page,
		perPage: categoryFilters.perPage,
		filters: categoryFilters.queryFilters,
	});
	const { data: unitsData, isLoading: isUnitsLoading, isFetching: isUnitsFetching } = useUnits({
		page: unitFilters.page,
		perPage: unitFilters.perPage,
		filters: unitFilters.queryFilters,
	});

	const selectedCategory = useMemo(
		() => selectedCategoryRef ?? categoriesData?.items.find((item) => String(item.id) === categoryId) ?? null,
		[selectedCategoryRef, categoriesData?.items, categoryId]
	);

	const selectedUnit = useMemo(
		() => selectedUnitRef ?? unitsData?.items.find((item) => String(item.id) === unitId) ?? null,
		[selectedUnitRef, unitsData?.items, unitId]
	);

	const handleSelectCategory = (category: Category) => {
		setSelectedCategoryRef(category);
		setValue('category_id', String(category.id), { shouldValidate: true, shouldDirty: true });
		clearErrors('category_id');
		setIsCategoryModalOpen(false);
	};

	const handleSelectUnit = (unit: Unit) => {
		setSelectedUnitRef(unit);
		setValue('unit_id', String(unit.id), { shouldValidate: true, shouldDirty: true });
		clearErrors('unit_id');
		setIsUnitModalOpen(false);
	};

	const onSubmit = async (values: CreateItemFormValues) => {
		setFormError(null);

		try {
			const response = isEditMode
				? await axios.put(
					`${env.VITE_API_BASE_URL}/master-data/products/${editId}`,
					values,
					{
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						withCredentials: true,
					}
				)
				: await axios.post(
					`${env.VITE_API_BASE_URL}/master-data/products`,
					values,
					{
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						withCredentials: true,
					}
				);

			const message = (response.data as { message?: string })?.message ?? (isEditMode ? 'Item berhasil diperbarui' : 'Item berhasil dibuat');
			toast.success(message);
			navigate('/masterdata/products');
		} catch (error) {
			if (axios.isAxiosError<ItemApiErrorResponse>(error)) {
				const apiNameError = error.response?.data?.errors?.product_name?.[0];
				const apiCategoryError = error.response?.data?.errors?.category_id?.[0];
				const apiUnitError = error.response?.data?.errors?.unit_id?.[0];

				if (apiNameError) {
					setError('product_name', { type: 'server', message: apiNameError });
				}

				if (apiCategoryError) {
					setError('category_id', { type: 'server', message: apiCategoryError });
				}

				if (apiUnitError) {
					setError('unit_id', { type: 'server', message: apiUnitError });
				}

				const apiStockLevelError = error.response?.data?.errors?.stock_level?.[0];
				if (apiStockLevelError) {
					setError('stock_level', { type: 'server', message: apiStockLevelError });
				}

				const apiMinStockLevelError = error.response?.data?.errors?.min_stock_level?.[0];
				if (apiMinStockLevelError) {
					setError('min_stock_level', { type: 'server', message: apiMinStockLevelError });
				}

				const apiMessage = error.response?.data?.message;
				if (apiMessage) {
					setFormError(apiMessage);
					toast.error(apiMessage);
					return;
				}
			}

			const fallbackMessage = 'Failed to create item. Please try again.';
			setFormError(fallbackMessage);
			toast.error(fallbackMessage);
		}
	};

	useEffect(() => {
		if (!isEditMode || !editId) {
			return;
		}

		let mounted = true;

		const loadProductDetail = async () => {
			setIsPrefilling(true);
			setFormError(null);

			try {
				const response = await axios.get<ProductDetailResponse>(
					`${env.VITE_API_BASE_URL}/master-data/products/${editId}`,
					{
						headers: {
							Accept: 'application/json',
						},
						withCredentials: true,
					}
				);

				const product = response.data?.data;

				if (!mounted) {
					return;
				}

				if (!product) {
					setFormError('Data item tidak ditemukan.');
					return;
				}

				reset({
					product_name: product.product_name,
					category_id: String(product.category_id),
					unit_id: String(product.unit_id),
					is_active: product.is_active ?? true,
					stock_level: product.stock_level,
					min_stock_level: product.min_stock_level,
				});
			} catch {
				if (!mounted) {
					return;
				}

				setFormError('Gagal memuat data item untuk edit.');
			} finally {
				if (mounted) {
					setIsPrefilling(false);
				}
			}
		};

		void loadProductDetail();

		return () => {
			mounted = false;
		};
	}, [editId, isEditMode, reset]);

	const categories = categoriesData?.items ?? [];
	const categoriesMeta = categoriesData?.meta;
	const units = unitsData?.items ?? [];
	const unitsMeta = unitsData?.meta;

	const visibleCategories = useMemo(() => {
		const q = categoryFilters.q.trim().toLowerCase();
		if (!q) return categories;
		return categories.filter((category) => String(category.category_name ?? '').toLowerCase().includes(q));
	}, [categories, categoryFilters.q]);

	const visibleUnits = useMemo(() => {
		const q = unitFilters.q.trim().toLowerCase();
		if (!q) return units;

		return units.filter((unit) => {
			const haystack = [`${unit.unit_code ?? ''}`, unit.unit_name].join(' ').toLowerCase();
			return haystack.includes(q);
		});
	}, [units, unitFilters.q]);

	const canGoCategoryPrev = Boolean(categoriesMeta?.hasPrevPage) && !isCategoriesFetching;
	const canGoCategoryNext = Boolean(categoriesMeta?.hasNextPage) && !isCategoriesFetching;
	const canGoUnitPrev = Boolean(unitsMeta?.hasPrevPage) && !isUnitsFetching;
	const canGoUnitNext = Boolean(unitsMeta?.hasNextPage) && !isUnitsFetching;

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
								<Link to="/masterdata/products">Products</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Create Item</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="space-y-1">
					<CardTitle>{isEditMode ? 'Edit Item' : 'Create Item'}</CardTitle>
					<CardDescription>
						{isEditMode
							? 'Perbarui item dengan referensi kategori dan unit.'
							: 'Tambah item baru dengan referensi kategori dan unit.'}
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent>
				{isPrefilling && (
					<p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
						Memuat data item...
					</p>
				)}
				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					<input type="hidden" {...register('category_id')} />
					<input type="hidden" {...register('unit_id')} />
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="item-name">Product Name</Label>
							<Input
								id="item-name"
								{...register('product_name')}
								placeholder="Masukkan nama product"
								autoFocus
							/>
							{errors.product_name?.message && <p className="text-sm text-red-600">{errors.product_name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label>Category</Label>
							<div className="flex gap-2">
								<Input
									value={selectedCategory ? selectedCategory.category_name : ''}
									placeholder="Pilih category"
									readOnly
								/>
								<Button type="button" variant="secondary" onClick={() => setIsCategoryModalOpen(true)}>
									Pilih
								</Button>
							</div>
							{errors.category_id?.message && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
						</div>

						<div className="space-y-2">
							<Label>Unit</Label>
							<div className="flex gap-2">
								<Input
									value={selectedUnit ? `${selectedUnit.unit_code ?? '-'} - ${selectedUnit.unit_name}` : ''}
									placeholder="Pilih unit"
									readOnly
								/>
								<Button type="button" variant="secondary" onClick={() => setIsUnitModalOpen(true)}>
									Pilih
								</Button>
							</div>
							{errors.unit_id?.message && <p className="text-sm text-red-600">{errors.unit_id.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="stock-level">Stock Level</Label>
							<Input
								id="stock-level"
								type="number"
								{...register('stock_level', { valueAsNumber: true })}
								placeholder="Masukkan stock level"
							/>
							{errors.stock_level?.message && <p className="text-sm text-red-600">{errors.stock_level.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="min-stock-level">Min Stock Level</Label>
							<Input
								id="min-stock-level"
								type="number"
								{...register('min_stock_level', { valueAsNumber: true })}
								placeholder="Masukkan minimum stock level"
							/>
							{errors.min_stock_level?.message && <p className="text-sm text-red-600">{errors.min_stock_level.message}</p>}
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="item-active">Status</Label>
							<label htmlFor="item-active" className="flex items-center gap-2 text-sm text-text-h">
								<input
									id="item-active"
									type="checkbox"
									{...register('is_active')}
									className="h-4 w-4 rounded border border-border accent-accent"
								/>
								<span>{isActive ? 'Aktif' : 'Tidak Aktif'}</span>
							</label>
						</div>
					</div>

					{formError && (
						<p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
					)}

					<div className="flex items-center justify-end gap-2">
						<Button type="button" variant="secondary" onClick={() => navigate('/masterdata/products')}>
							Batal
						</Button>
						<Button type="submit" disabled={isSubmitting || isPrefilling}>
							{isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan'}
						</Button>
					</div>
				</form>
			</CardContent>

			<Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Pilih Category</DialogTitle>
						<DialogDescription>Pilih category dari tabel referensi.</DialogDescription>
					</DialogHeader>

					<MasterdataSearchBar
						value={categoryFilters.q}
						onChange={categoryFilters.updateSearch}
						onReset={categoryFilters.resetFilters}
						isLoading={isCategoriesLoading || isCategoriesFetching}
						placeholder="Cari nama category"
						variant="compact"
					/>

					<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
						<table className="w-full border-collapse text-left text-sm">
							<thead className="sticky top-0 bg-surface-2">
								<tr>
									<th className="px-4 py-3">Name</th>
									<th className="px-4 py-3 text-right">Action</th>
								</tr>
							</thead>
							<tbody>
								{isCategoriesLoading ? (
									<tr>
										<td className="px-4 py-4" colSpan={2}>Loading categories...</td>
									</tr>
								) : visibleCategories.length === 0 ? (
									<tr>
										<td className="px-4 py-4" colSpan={2}>No categories found.</td>
									</tr>
								) : (
									visibleCategories.map((category) => (
										<tr key={category.id} className="border-t border-border/70">
											<td className="px-4 py-3">{category.category_name}</td>
											<td className="px-4 py-3 text-right">
												<Button type="button" size="sm" onClick={() => handleSelectCategory(category)}>
													Pilih
												</Button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<DialogFooter>
						<div className="mr-auto flex items-center gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => categoryFilters.setPage(categoryFilters.page - 1)}
								disabled={!canGoCategoryPrev}
							>
								Previous
							</Button>
							<span className="text-xs text-text">
								Page {categoriesMeta?.currentPage ?? categoryFilters.page} / {categoriesMeta?.lastPage ?? 1}
							</span>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() =>
									categoryFilters.setPage(
										Math.min(categoriesMeta?.lastPage ?? categoryFilters.page + 1, categoryFilters.page + 1)
									)
								}
								disabled={!canGoCategoryNext}
							>
								Next
							</Button>
						</div>
						<Button type="button" variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isUnitModalOpen} onOpenChange={setIsUnitModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Pilih Unit</DialogTitle>
						<DialogDescription>Pilih unit dari tabel referensi.</DialogDescription>
					</DialogHeader>

					<MasterdataSearchBar
						value={unitFilters.q}
						onChange={unitFilters.updateSearch}
						onReset={unitFilters.resetFilters}
						isLoading={isUnitsLoading || isUnitsFetching}
						placeholder="Cari nama atau kode unit"
						variant="compact"
					/>

					<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
						<table className="w-full border-collapse text-left text-sm">
							<thead className="sticky top-0 bg-surface-2">
								<tr>
									<th className="px-4 py-3">Code</th>
									<th className="px-4 py-3">Name</th>
									<th className="px-4 py-3 text-right">Action</th>
								</tr>
							</thead>
							<tbody>
								{isUnitsLoading ? (
									<tr>
										<td className="px-4 py-4" colSpan={3}>Loading units...</td>
									</tr>
								) : visibleUnits.length === 0 ? (
									<tr>
										<td className="px-4 py-4" colSpan={3}>No units found.</td>
									</tr>
								) : (
									visibleUnits.map((unit) => (
										<tr key={unit.id} className="border-t border-border/70">
											<td className="px-4 py-3">{unit.unit_code ?? '-'}</td>
											<td className="px-4 py-3">{unit.unit_name}</td>
											<td className="px-4 py-3 text-right">
												<Button type="button" size="sm" onClick={() => handleSelectUnit(unit)}>
													Pilih
												</Button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<DialogFooter>
						<div className="mr-auto flex items-center gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => unitFilters.setPage(unitFilters.page - 1)}
								disabled={!canGoUnitPrev}
							>
								Previous
							</Button>
							<span className="text-xs text-text">
								Page {unitsMeta?.currentPage ?? unitFilters.page} / {unitsMeta?.lastPage ?? 1}
							</span>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() =>
									unitFilters.setPage(
										Math.min(unitsMeta?.lastPage ?? unitFilters.page + 1, unitFilters.page + 1)
									)
								}
								disabled={!canGoUnitNext}
							>
								Next
							</Button>
						</div>
						<Button type="button" variant="secondary" onClick={() => setIsUnitModalOpen(false)}>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
