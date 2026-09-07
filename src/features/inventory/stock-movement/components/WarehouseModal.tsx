"use no memo";

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { SearchBar } from '../../../../components/ui/searchbar';
import { useReferenceTableFilters } from '../../../masterdata/hooks/useReferenceTableFilters';
import { useWarehouses } from '../../../masterdata/warehouses/hooks/useWarehouses';
import type { Warehouse } from '../../../masterdata/warehouses/types/warehouse.types';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWarehouse: (warehouse: Warehouse) => void;
}

export function WarehouseModal({ isOpen, onClose, onSelectWarehouse }: WarehouseModalProps) {
  const warehouseFilters = useReferenceTableFilters(10);
  const { data: warehousesData, isLoading: isWarehousesLoading, isFetching: isWarehousesFetching } = useWarehouses({
    page: warehouseFilters.page,
    perPage: warehouseFilters.perPage,
    filters: warehouseFilters.queryFilters,
  });

  const warehouses = useMemo(() => warehousesData?.items ?? [], [warehousesData?.items]);
  const warehousesMeta = warehousesData?.meta;

  const visibleWarehouses = useMemo(() => {
    const query = warehouseFilters.q.trim().toLowerCase();
    if (!query) return warehouses;

    return warehouses.filter((warehouse) => {
      const haystack = [warehouse.name, warehouse.code ?? ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [warehouses, warehouseFilters.q]);

  const canGoPrev = Boolean(warehousesMeta?.hasPrevPage) && !isWarehousesFetching;
  const canGoNext = Boolean(warehousesMeta?.hasNextPage) && !isWarehousesFetching;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pilih Warehouse</DialogTitle>
          <DialogDescription>Pilih warehouse untuk stock movement.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <SearchBar
            value={warehouseFilters.q}
            onChange={warehouseFilters.updateSearch}
            onReset={warehouseFilters.resetFilters}
            placeholder="Cari nama warehouse atau kode"
          />
        </div>

        <div className="mt-4 flex-1 overflow-auto rounded-xl border border-border/80">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-semibold text-text-h">Kode</th>
                <th className="px-4 py-3 font-semibold text-text-h">Nama Warehouse</th>
                <th className="px-4 py-3 font-semibold text-text-h">Lokasi</th>
                <th className="px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isWarehousesLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center" colSpan={4}>
                    Loading warehouses...
                  </td>
                </tr>
              ) : visibleWarehouses.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-text italic" colSpan={4}>
                    Tidak ada warehouse yang tersedia.
                  </td>
                </tr>
              ) : (
                visibleWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-text-h">{warehouse.code ?? '-'}</td>
                    <td className="px-4 py-3 text-text">{warehouse.name}</td>
                    <td className="px-4 py-3 text-text">{warehouse.location ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" size="sm" variant="ghost" onClick={() => onSelectWarehouse(warehouse)}>
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
              onClick={() => warehouseFilters.setPage(warehouseFilters.page - 1)}
              disabled={!canGoPrev}
            >
              Sebelumnya
            </Button>
            <span className="text-xs font-semibold text-text-h px-2">
              Halaman {warehousesMeta?.currentPage ?? warehouseFilters.page} / {warehousesMeta?.lastPage ?? 1}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => warehouseFilters.setPage(warehouseFilters.page + 1)}
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
