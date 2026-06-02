import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { ExportButton } from '../../../../components/ui/ExportButton';
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { useProducts } from '../hooks/useProducts';
import { ProductsTable } from '../components/ProductsTable';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import { masterdataExportService } from '../../services/masterdataExportService';
import type { Product } from '../types/product.types';
import { Plus } from 'lucide-react';

export function ProductsTableSection() {
  const navigate = useNavigate();
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingProductId] = useState<string | number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const deleteProductMutation = useDeleteProduct();

  const { data, isLoading, isError, isFetching } = useProducts({ page, perPage, filters: queryFilters });
  const products = data?.items ?? [];
  const meta = data?.meta;

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  const handlePrevPage = () => {
    if (!canGoPrev) {
      return;
    }

    setPage(page - 1);
  };

  const handleNextPage = () => {
    if (!canGoNext || !meta) {
      return;
    }

    setPage(Math.min(meta.lastPage, page + 1));
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/items/create?mode=edit&id=${product.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    setDeletingProductId(selectedProduct.id);

    try {
      const result = await deleteProductMutation.mutateAsync(selectedProduct.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch {
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setDeletingProductId(null);
    }
  };

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
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage Data Products
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton
                onExport={() => masterdataExportService.exportMasterdata('products', { q: uiFilters.q })}
                filename={`products-${new Date().toISOString().split('T')[0]}.xlsx`}
                disabled={isLoading || isFetching}
                size="sm"
                label="Export Excel"
              />
              <Button asChild type="button" size="sm" className="gap-1.5">
                <Link to="/items/create">
                  <Plus className="h-4 w-4" />
                  Tambah
                </Link>
              </Button>
            </div>
          </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MasterdataSearchBar
            value={uiFilters.q}
            onChange={(q) => updateFilters({ q })}
            onReset={resetFilters}
            isLoading={isLoading || isFetching}
            placeholder="Cari nama product"
          />

          <ProductsTable
            data={products}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            updatingProductId={updatingProductId}
            deletingProductId={deletingProductId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Showing ${meta.from}-${meta.to} of ${meta.total} products`
                : 'Showing 0 products'}
            </p>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handlePrevPage} disabled={!canGoPrev}>
                Previous
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Page {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
              </span>
              <Button type="button" variant="secondary" size="sm" onClick={handleNextPage} disabled={!canGoNext}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);

          if (!open) {
            setSelectedProduct(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Product</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? `Yakin ingin menghapus product "${selectedProduct.product_name}"?`
                : 'Yakin ingin menghapus product ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteProductMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteProductMutation.isPending || !selectedProduct}
            >
              {deleteProductMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
