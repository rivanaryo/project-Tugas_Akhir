"use no memo";

import { useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
import { useVendors } from '../../vendors/hooks/useVendors';
import type { Vendor } from '../../vendors/types/vendor.types';
import { useProducts } from '../../items/hooks/useProducts';
import type { Product } from '../../items/types/product.types';
import { useCreatePricelist } from '../hooks/useCreatePricelist';
import { createPricelistInputSchema, type CreatePricelistInput } from '../schemas/pricelist.schema';

interface PricelistApiErrorResponse {
	message?: string;
	errors?: {
		vendor_id?: string[];
		product_id?: string[];
		price?: string[];
		currency?: string[];
	};
}

type CreatePricelistFormValues = z.infer<typeof createPricelistInputSchema>;

export function CreatePricelistPage() {
	"use no memo";

	const navigate = useNavigate();
	const [formError, setFormError] = useState<string | null>(null);
	const createPricelistMutation = useCreatePricelist();

	const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const vendorFilters = useReferenceTableFilters(10);
	const productFilters = useReferenceTableFilters(10);
	const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		setError,
		clearErrors,
		control,
		formState: { errors, isSubmitting },
	} = useForm<z.input<typeof createPricelistInputSchema>, unknown, CreatePricelistInput>({
		resolver: zodResolver(createPricelistInputSchema),
		defaultValues: {
			vendor_id: '',
			product_id: '',
			price: '',
			currency: 'IDR',
			is_active: true,
		},
	});

	const vendorId = useWatch({ control, name: 'vendor_id', defaultValue: '' });
	const productId = useWatch({ control, name: 'product_id', defaultValue: '' });
	const isActive = useWatch({ control, name: 'is_active', defaultValue: true });

	const { data: vendorsData, isLoading: isVendorsLoading, isFetching: isVendorsFetching } = useVendors({
		page: vendorFilters.page,
		perPage: vendorFilters.perPage,
		filters: vendorFilters.queryFilters,
	});
	const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching } = useProducts({
		page: productFilters.page,
		perPage: productFilters.perPage,
		filters: productFilters.queryFilters,
	});

	const vendors = vendorsData?.items ?? [];
	const vendorsMeta = vendorsData?.meta;
	const products = productsData?.items ?? [];
	const productsMeta = productsData?.meta;

	const visibleVendors = useMemo(() => {
		const q = vendorFilters.q.trim().toLowerCase();
		if (!q) return vendors;

		return vendors.filter((vendor) => {
			const haystack = [
				vendor.vendor_name,
				vendor.contact_person ?? '',
				vendor.phone_number ?? '',
				vendor.email ?? '',
			]
				.join(' ')
				.toLowerCase();

			return haystack.includes(q);
		});
	}, [vendors, vendorFilters.q]);

	const visibleProducts = useMemo(() => {
		const q = productFilters.q.trim().toLowerCase();
		if (!q) return products;
		return products.filter((product) => String(product.product_name ?? '').toLowerCase().includes(q));
	}, [products, productFilters.q]);

	const selectedVendorLabel = useMemo(() => {
		if (selectedVendor) return selectedVendor.vendor_name;
		const fromPage = vendors.find((item) => String(item.id) === vendorId);
		return fromPage?.vendor_name ?? '';
	}, [selectedVendor, vendors, vendorId]);

	const selectedProductLabel = useMemo(() => {
		if (selectedProduct) return selectedProduct.product_name;
		const fromPage = products.find((item) => String(item.id) === productId);
		return fromPage?.product_name ?? '';
	}, [selectedProduct, products, productId]);

	const handleSelectVendor = (vendor: Vendor) => {
		setSelectedVendor(vendor);
		setValue('vendor_id', String(vendor.id), { shouldValidate: true, shouldDirty: true });
		clearErrors('vendor_id');
		setIsVendorModalOpen(false);
	};

	const handleSelectProduct = (product: Product) => {
		setSelectedProduct(product);
		setValue('product_id', String(product.id), { shouldValidate: true, shouldDirty: true });
		clearErrors('product_id');
		setIsProductModalOpen(false);
	};

	const onSubmit = async (values: CreatePricelistFormValues) => {
		setFormError(null);

		try {
			const result = await createPricelistMutation.mutateAsync(values);
			toast.success(result.message);
			navigate('/masterdata/pricelists');
		} catch (error) {
			if (axios.isAxiosError<PricelistApiErrorResponse>(error)) {
				const vendorApiError = error.response?.data?.errors?.vendor_id?.[0];
				const productApiError = error.response?.data?.errors?.product_id?.[0];
				const priceApiError = error.response?.data?.errors?.price?.[0];
				const currencyApiError = error.response?.data?.errors?.currency?.[0];

				if (vendorApiError) setError('vendor_id', { type: 'server', message: vendorApiError });
				if (productApiError) setError('product_id', { type: 'server', message: productApiError });
				if (priceApiError) setError('price', { type: 'server', message: priceApiError });
				if (currencyApiError) setError('currency', { type: 'server', message: currencyApiError });

				const apiMessage = error.response?.data?.message;
				if (apiMessage) {
					setFormError(apiMessage);
					toast.error(apiMessage);
					return;
				}
			}

			const fallbackMessage = 'Gagal membuat pricelist. Silakan coba lagi.';
			setFormError(fallbackMessage);
			toast.error(fallbackMessage);
		}
	};

	const canGoVendorPrev = Boolean(vendorsMeta?.hasPrevPage) && !isVendorsFetching;
	const canGoVendorNext = Boolean(vendorsMeta?.hasNextPage) && !isVendorsFetching;
	const canGoProductPrev = Boolean(productsMeta?.hasPrevPage) && !isProductsFetching;
	const canGoProductNext = Boolean(productsMeta?.hasNextPage) && !isProductsFetching;

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
								<Link to="/masterdata/pricelists">Pricelists</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Create Pricelist</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="space-y-1">
					<CardTitle>Create Pricelist</CardTitle>
					<CardDescription>Tambah pricelist vendor untuk produk</CardDescription>
				</div>
			</CardHeader>

			<CardContent>
				<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
					<input type="hidden" {...register('vendor_id')} />
					<input type="hidden" {...register('product_id')} />
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Vendor</Label>
							<div className="flex gap-2">
								<Input
									value={selectedVendorLabel}
									placeholder="Pilih vendor"
									readOnly
								/>
								<Button type="button" variant="secondary" onClick={() => setIsVendorModalOpen(true)}>
									Pilih
								</Button>
							</div>
							{errors.vendor_id?.message && <p className="text-sm text-red-600">{errors.vendor_id.message}</p>}
						</div>

						<div className="space-y-2">
							<Label>Produk</Label>
							<div className="flex gap-2">
								<Input
									value={selectedProductLabel}
									placeholder="Pilih produk"
									readOnly
								/>
								<Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(true)}>
									Pilih
								</Button>
							</div>
							{errors.product_id?.message && <p className="text-sm text-red-600">{errors.product_id.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="price">Harga</Label>
							<Input id="price" {...register('price')} placeholder="Contoh: 30000.00" />
							{errors.price?.message && <p className="text-sm text-red-600">{errors.price.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="currency">Mata Uang</Label>
							<Input id="currency" {...register('currency')} placeholder="Contoh: IDR" />
							{errors.currency?.message && <p className="text-sm text-red-600">{errors.currency.message}</p>}
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="pricelist-active">Status</Label>
							<label htmlFor="pricelist-active" className="flex items-center gap-2 text-sm text-text-h">
								<input
									id="pricelist-active"
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
						<Button type="button" variant="secondary" onClick={() => navigate('/masterdata/pricelists')}>
							Batal
						</Button>
						<Button type="submit" disabled={isSubmitting || createPricelistMutation.isPending}>
							{isSubmitting || createPricelistMutation.isPending ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</div>
				</form>
			</CardContent>

			<Dialog
				open={isVendorModalOpen}
				onOpenChange={(open) => {
					setIsVendorModalOpen(open);
					if (open) vendorFilters.setPage(1);
				}}
			>
				<DialogContent className="max-w-none">
					<DialogHeader>
						<DialogTitle>Pilih Vendor</DialogTitle>
						<DialogDescription>Pilih vendor dari tabel referensi.</DialogDescription>
					</DialogHeader>

					<MasterdataSearchBar
						value={vendorFilters.q}
						onChange={vendorFilters.updateSearch}
						onReset={vendorFilters.resetFilters}
						isLoading={isVendorsLoading || isVendorsFetching}
						placeholder="Cari vendor, kontak, email, atau telepon"
						variant="compact"
					/>

					<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
						<table className="w-full border-collapse text-left text-sm">
							<thead className="sticky top-0 bg-surface-2">
								<tr>
									<th className="px-4 py-3">Vendor</th>
									<th className="px-4 py-3">Contact</th>
									<th className="px-4 py-3">Phone</th>
									<th className="px-4 py-3">Email</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3 text-right">Action</th>
								</tr>
							</thead>
							<tbody>
								{isVendorsLoading ? (
									<tr>
										<td className="px-4 py-4" colSpan={6}>Loading vendors...</td>
									</tr>
								) : visibleVendors.length === 0 ? (
									<tr>
										<td className="px-4 py-4" colSpan={6}>Tidak ada data vendor.</td>
									</tr>
								) : (
									visibleVendors.map((vendor) => (
										<tr key={vendor.id} className="border-t border-border/70">
											<td className="px-4 py-3">{vendor.vendor_name}</td>
											<td className="px-4 py-3">{vendor.contact_person ?? '-'}</td>
											<td className="px-4 py-3">{vendor.phone_number ?? '-'}</td>
											<td className="px-4 py-3">{vendor.email ?? '-'}</td>
											<td className="px-4 py-3">{vendor.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
											<td className="px-4 py-3 text-right">
												<Button type="button" size="sm" onClick={() => handleSelectVendor(vendor)}>
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
								onClick={() => vendorFilters.setPage(vendorFilters.page - 1)}
								disabled={!canGoVendorPrev}
							>
								Sebelumnya
							</Button>
							<span className="text-xs text-text">
								Halaman {vendorsMeta?.currentPage ?? vendorFilters.page} / {vendorsMeta?.lastPage ?? 1}
							</span>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => vendorFilters.setPage(Math.min(vendorsMeta?.lastPage ?? vendorFilters.page + 1, vendorFilters.page + 1))}
								disabled={!canGoVendorNext}
							>
								Selanjutnya
							</Button>
						</div>
						<Button type="button" variant="secondary" onClick={() => setIsVendorModalOpen(false)}>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isProductModalOpen}
				onOpenChange={(open) => {
					setIsProductModalOpen(open);
					if (open) productFilters.setPage(1);
				}}
			>
				<DialogContent className="max-w-none">
					<DialogHeader>
						<DialogTitle>Pilih Produk</DialogTitle>
						<DialogDescription>Pilih produk dari tabel referensi.</DialogDescription>
					</DialogHeader>

					<MasterdataSearchBar
						value={productFilters.q}
						onChange={productFilters.updateSearch}
						onReset={productFilters.resetFilters}
						isLoading={isProductsLoading || isProductsFetching}
						placeholder="Cari nama produk"
						variant="compact"
					/>

					<div className="max-h-[45vh] overflow-auto rounded-xl border border-border/80">
						<table className="w-full border-collapse text-left text-sm">
							<thead className="sticky top-0 bg-surface-2">
								<tr>
									<th className="px-4 py-3">Produk</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3 text-right">Action</th>
								</tr>
							</thead>
							<tbody>
								{isProductsLoading ? (
									<tr>
										<td className="px-4 py-4" colSpan={3}>Loading products...</td>
									</tr>
								) : visibleProducts.length === 0 ? (
									<tr>
										<td className="px-4 py-4" colSpan={3}>Tidak ada data produk.</td>
									</tr>
								) : (
									visibleProducts.map((product) => (
										<tr key={product.id} className="border-t border-border/70">
											<td className="px-4 py-3">{product.product_name}</td>
											<td className="px-4 py-3">{product.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
											<td className="px-4 py-3 text-right">
												<Button type="button" size="sm" onClick={() => handleSelectProduct(product)}>
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
								onClick={() => productFilters.setPage(productFilters.page - 1)}
								disabled={!canGoProductPrev}
							>
								Sebelumnya
							</Button>
							<span className="text-xs text-text">
								Halaman {productsMeta?.currentPage ?? productFilters.page} / {productsMeta?.lastPage ?? 1}
							</span>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => productFilters.setPage(Math.min(productsMeta?.lastPage ?? productFilters.page + 1, productFilters.page + 1))}
								disabled={!canGoProductNext}
							>
								Selanjutnya
							</Button>
						</div>
						<Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(false)}>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
