"use no memo";

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { SearchBar } from '../../../../components/ui/searchbar';
import { useReferenceTableFilters } from '../../../masterdata/hooks/useReferenceTableFilters';
import { useProducts } from '../../../masterdata/items/hooks/useProducts';
import type { Product } from '../../../masterdata/items/types/product.types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductModal({ isOpen, onClose, onSelectProduct }: ProductModalProps) {
  const productFilters = useReferenceTableFilters(10);
  const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching } = useProducts({
    page: productFilters.page,
    perPage: productFilters.perPage,
    filters: productFilters.queryFilters,
  });

  const products = useMemo(() => productsData?.items ?? [], [productsData?.items]);
  const productsMeta = productsData?.meta;

  const visibleProducts = useMemo(() => {
    const query = productFilters.q.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const haystack = [product.product_name].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [products, productFilters.q]);

  const canGoPrev = Boolean(productsMeta?.hasPrevPage) && !isProductsFetching;
  const canGoNext = Boolean(productsMeta?.hasNextPage) && !isProductsFetching;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pilih Product</DialogTitle>
          <DialogDescription>Pilih product untuk stock movement.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <SearchBar
            value={productFilters.q}
            onChange={productFilters.updateSearch}
            onReset={productFilters.resetFilters}
            placeholder="Cari nama product atau kode"
          />
        </div>

        <div className="mt-4 flex-1 overflow-auto rounded-xl border border-border/80">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-semibold text-text-h">Nama Product</th>
                <th className="px-4 py-3 font-semibold text-text-h">Unit</th>
                <th className="px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isProductsLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center" colSpan={3}>
                    Loading products...
                  </td>
                </tr>
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-text italic" colSpan={3}>
                    Tidak ada product yang tersedia.
                  </td>
                </tr>
              ) : (
                visibleProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 text-text">{product.product_name}</td>
                    <td className="px-4 py-3 text-text">{product.unit?.unit_name ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" size="sm" variant="ghost" onClick={() => onSelectProduct(product)}>
                        Pilih
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => productFilters.setPage(productFilters.page - 1)}
              disabled={!canGoPrev}
            >
              Sebelumnya
            </Button>
            <span className="text-xs font-semibold text-text-h px-2">
              Halaman {productsMeta?.currentPage ?? productFilters.page} / {productsMeta?.lastPage ?? 1}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => productFilters.setPage(productFilters.page + 1)}
              disabled={!canGoNext}
            >
              Selanjutnya
            </Button>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
