import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { useCategories } from '../hooks/useCategories';
import { CategoriesTable } from '../components/CategoriesTable';
import { AddCategoryDialog } from '../components/AddCategoryDialog';
import { EditCategoryDialog } from '../components/EditCategoryDialog';
import { MasterdataSearchBar } from '../../components/MasterdataSearchBar';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { useMasterdataListFilters } from '../../hooks/useMasterdataListFilters';
import { masterdataExportService } from '../../services/masterdataExportService';
import type { Category } from '../types/category.types';

export function CategoriesTableSection() {
  const { page, perPage, uiFilters, queryFilters, setPage, updateFilters, resetFilters } = useMasterdataListFilters();
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEditCategory, setSelectedEditCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const deleteCategoryMutation = useDeleteCategory();

  const { data, isLoading, isError, isFetching } = useCategories({ page, perPage, filters: queryFilters });
  const categories = data?.items ?? [];
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

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setUpdatingCategoryId(category.id);
    setSelectedEditCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    setDeletingCategoryId(selectedCategory.id);

    try {
      const result = await deleteCategoryMutation.mutateAsync(selectedCategory.id);
      toast.success(result.message);
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch {
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setDeletingCategoryId(null);
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
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage Data Categories
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <ExportButton
                onExport={() => masterdataExportService.exportMasterdata('categories', { q: uiFilters.q })}
                filename={`categories-${new Date().toISOString().split('T')[0]}.xlsx`}
                disabled={isLoading || isFetching}
                size="sm"
                label="Export Excel"
              />
              <AddCategoryDialog onCreated={() => setPage(1)} />
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
            placeholder="Cari nama category"
          />

          <CategoriesTable
            data={categories}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            updatingCategoryId={updatingCategoryId}
            deletingCategoryId={deletingCategoryId}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Showing ${meta.from}-${meta.to} of ${meta.total} categories`
                : 'Showing 0 categories'}
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
            setSelectedCategory(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Category</DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? `Yakin ingin menghapus category "${selectedCategory.category_name}"?`
                : 'Yakin ingin menghapus category ini?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteCategoryMutation.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteCategoryMutation.isPending || !selectedCategory}
            >
              {deleteCategoryMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCategoryDialog
        open={isEditDialogOpen}
        category={selectedEditCategory}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setSelectedEditCategory(null);
            setUpdatingCategoryId(null);
          }
        }}
      />
    </Card>
  );
}
