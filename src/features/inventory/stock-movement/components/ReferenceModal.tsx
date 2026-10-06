"use no memo";

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { SearchBar } from '../../../../components/ui/searchbar';
import { useReferenceTableFilters } from '../../../masterdata/hooks/useReferenceTableFilters';
import { useSalesOrders } from '../../../sales/sales-order/hooks/useSalesOrders';
import { usePurchaseOrders } from '../../../inventory/purchase-orders/hooks/usePurchaseOrders';
import type { SalesOrderHead } from '../../../sales/sales-order/types/salesOrder.types';
import type { PurchaseOrderHead } from '../../../inventory/purchase-orders/types/purchaseOrder.types';
import type { CreateReferenceableType } from '../types/stockMovement.types';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference: (id: string, type: CreateReferenceableType) => void;
}

type TabType = 'sales_order' | 'purchase_order';

export function ReferenceModal({ isOpen, onClose, onSelectReference }: ReferenceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sales_order');

  const soFilters = useReferenceTableFilters(10);
  const { data: salesOrdersData, isLoading: isSalesOrdersLoading, isFetching: isSalesOrdersFetching } = useSalesOrders({
    page: soFilters.page,
    perPage: soFilters.perPage,
    filters: soFilters.queryFilters,
  });

  const poFilters = useReferenceTableFilters(10);
  const { data: purchaseOrdersData, isLoading: isPurchaseOrdersLoading, isFetching: isPurchaseOrdersFetching } = usePurchaseOrders({
    page: poFilters.page,
    perPage: poFilters.perPage,
    filters: poFilters.queryFilters,
  });

  const salesOrders = useMemo(() => salesOrdersData?.items ?? [], [salesOrdersData?.items]);
  const salesOrdersMeta = salesOrdersData?.meta;
  const purchaseOrders = useMemo(() => purchaseOrdersData?.items ?? [], [purchaseOrdersData?.items]);
  const purchaseOrdersMeta = purchaseOrdersData?.meta;

  const visibleSalesOrders = useMemo(() => {
    const query = soFilters.q.trim().toLowerCase();
    if (!query) return salesOrders;

    return salesOrders.filter((order) => {
      const haystack = [order.order_number, order.customer?.customer_name ?? ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [salesOrders, soFilters.q]);

  const visiblePurchaseOrders = useMemo(() => {
    const query = poFilters.q.trim().toLowerCase();
    if (!query) return purchaseOrders;

    return purchaseOrders.filter((order) => {
      const haystack = [order.po_number, order.vendor?.vendor_name ?? ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [purchaseOrders, poFilters.q]);

  const canGoPrevSO = Boolean(salesOrdersMeta?.hasPrevPage) && !isSalesOrdersFetching;
  const canGoNextSO = Boolean(salesOrdersMeta?.hasNextPage) && !isSalesOrdersFetching;
  const canGoPrevPO = Boolean(purchaseOrdersMeta?.hasPrevPage) && !isPurchaseOrdersFetching;
  const canGoNextPO = Boolean(purchaseOrdersMeta?.hasNextPage) && !isPurchaseOrdersFetching;

  const handleSelectSalesOrder = (so: SalesOrderHead) => {
    onSelectReference(String(so.id), 'Sales Order');
    onClose();
  };

  const handleSelectPurchaseOrder = (po: PurchaseOrderHead) => {
    onSelectReference(String(po.id), 'Purchase Order');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pilih Referensi</DialogTitle>
          <DialogDescription>Pilih referensi Sales Order atau Purchase Order.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b border-border">
          <Button
            type="button"
            variant={activeTab === 'sales_order' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sales_order')}
            className="rounded-b-none"
          >
            Sales Order
          </Button>
          <Button
            type="button"
            variant={activeTab === 'purchase_order' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('purchase_order')}
            className="rounded-b-none"
          >
            Purchase Order
          </Button>
        </div>

        <div className="mt-2">
          <SearchBar
            value={activeTab === 'sales_order' ? soFilters.q : poFilters.q}
            onChange={activeTab === 'sales_order' ? soFilters.updateSearch : poFilters.updateSearch}
            onReset={activeTab === 'sales_order' ? soFilters.resetFilters : poFilters.resetFilters}
            placeholder={activeTab === 'sales_order' ? 'Cari nomor SO atau nama customer' : 'Cari nomor PO atau nama vendor'}
          />
        </div>

        <div className="mt-4 flex-1 overflow-auto rounded-xl border border-border/80">
          {activeTab === 'sales_order' ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-h">SO Number</th>
                  <th className="px-4 py-3 font-semibold text-text-h">Customer</th>
                  <th className="px-4 py-3 font-semibold text-text-h">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isSalesOrdersLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center" colSpan={4}>
                      Loading sales orders...
                    </td>
                  </tr>
                ) : visibleSalesOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-text italic" colSpan={4}>
                      Tidak ada sales order yang tersedia.
                    </td>
                  </tr>
                ) : (
                  visibleSalesOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-h">{so.order_number}</td>
                      <td className="px-4 py-3 text-text">{so.customer?.customer_name ?? '-'}</td>
                      <td className="px-4 py-3 text-text">{so.order_date.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleSelectSalesOrder(so)}>
                          Pilih
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-h">PO Number</th>
                  <th className="px-4 py-3 font-semibold text-text-h">Vendor</th>
                  <th className="px-4 py-3 font-semibold text-text-h">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-text-h text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isPurchaseOrdersLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center" colSpan={4}>
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : visiblePurchaseOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-text italic" colSpan={4}>
                      Tidak ada purchase order yang tersedia.
                    </td>
                  </tr>
                ) : (
                  visiblePurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-h">{po.po_number}</td>
                      <td className="px-4 py-3 text-text">{po.vendor?.vendor_name ?? '-'}</td>
                      <td className="px-4 py-3 text-text">{po.po_date.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleSelectPurchaseOrder(po)}>
                          Pilih
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab === 'sales_order' ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => soFilters.setPage(soFilters.page - 1)}
                  disabled={!canGoPrevSO}
                >
                  Sebelumnya
                </Button>
                <span className="text-xs font-semibold text-text-h px-2">
                  Halaman {salesOrdersMeta?.currentPage ?? soFilters.page} / {salesOrdersMeta?.lastPage ?? 1}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => soFilters.setPage(soFilters.page + 1)}
                  disabled={!canGoNextSO}
                >
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => poFilters.setPage(poFilters.page - 1)}
                  disabled={!canGoPrevPO}
                >
                  Sebelumnya
                </Button>
                <span className="text-xs font-semibold text-text-h px-2">
                  Halaman {purchaseOrdersMeta?.currentPage ?? poFilters.page} / {purchaseOrdersMeta?.lastPage ?? 1}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => poFilters.setPage(poFilters.page + 1)}
                  disabled={!canGoNextPO}
                >
                  Selanjutnya
                </Button>
              </>
            )}
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
