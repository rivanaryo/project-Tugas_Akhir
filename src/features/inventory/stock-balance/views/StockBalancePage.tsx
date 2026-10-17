import { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { StockBalanceSummaryCards } from '../components/StockBalanceSummaryCards';
import { StockBalanceFilterBar } from '../components/StockBalanceFilterBar';
import { StockBalanceTable } from '../components/StockBalanceTable';
import { useStockBalance } from '../hooks/useStockBalance';
import { useWarehouses } from '../../../masterdata/warehouses/hooks/useWarehouses';
import { useProducts } from '../../../masterdata/items/hooks/useProducts';
import type { StockBalanceSummary } from '../types/stockBalance.types';

type SortField = 'product_name' | 'current_stock' | 'total_in' | 'total_out';
type SortDir = 'asc' | 'desc';

export function StockBalancePage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('current_stock');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Applied filters (only sent to API on "Filter" click)
  const [appliedQ, setAppliedQ] = useState('');
  const [appliedWarehouseId, setAppliedWarehouseId] = useState('');
  const [appliedProductId, setAppliedProductId] = useState('');

  const { data: warehousesData, isLoading: isWarehousesLoading } = useWarehouses({ page: 1, perPage: 100 });
  const warehouses = warehousesData?.items ?? [];

  const { data: productsData, isLoading: isProductsLoading } = useProducts({ page: 1, perPage: 200 });
  const products = productsData?.items ?? [];

  const { data, isLoading, isError, isFetching } = useStockBalance({
    page,
    perPage: 15,
    filters: {
      q: appliedQ || undefined,
      warehouse_id: appliedWarehouseId || undefined,
      product_id: appliedProductId || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    },
  });

  const items = data?.items ?? [];
  const meta = data?.meta;

  const summary: StockBalanceSummary = useMemo(() => {
    const uniqueProducts = new Set(items.map((i) => i.product_id));
    const uniqueWarehouses = new Set(items.map((i) => i.warehouse_id));
    const negativeStockCount = items.filter((i) => i.current_stock < 0).length;
    const safeStockCount = items.filter((i) => i.current_stock > 0).length;

    return {
      totalProducts: uniqueProducts.size,
      totalWarehouses: uniqueWarehouses.size,
      negativeStockCount,
      safeStockCount,
    };
  }, [items]);

  const handleSort = useCallback((field: SortField) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  }, [sortBy]);

  const handleFilter = () => {
    setAppliedQ(q);
    setAppliedWarehouseId(warehouseId);
    setAppliedProductId(productId);
    setPage(1);
  };

  const handleReset = () => {
    setQ('');
    setWarehouseId('');
    setProductId('');
    setAppliedQ('');
    setAppliedWarehouseId('');
    setAppliedProductId('');
    setSortBy('current_stock');
    setSortDir('desc');
    setPage(1);
  };

  const canGoPrev = Boolean(meta?.hasPrevPage) && !isFetching;
  const canGoNext = Boolean(meta?.hasNextPage) && !isFetching;

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inventory">Inventory</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Stock Balance</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Stock Balance / Stok Akhir</CardTitle>
          <CardDescription>Lihat saldo stok akhir per produk dan gudang.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <StockBalanceSummaryCards summary={summary} isLoading={isLoading} />

          <StockBalanceFilterBar
            q={q}
            warehouseId={warehouseId}
            productId={productId}
            warehouses={warehouses}
            products={products}
            isWarehousesLoading={isWarehousesLoading}
            isProductsLoading={isProductsLoading}
            isLoading={isLoading || isFetching}
            onChangeQ={setQ}
            onChangeWarehouse={setWarehouseId}
            onChangeProduct={setProductId}
            onFilter={handleFilter}
            onReset={handleReset}
          />

          <StockBalanceTable
            data={items}
            isLoading={isLoading}
            isError={isError}
            rowStartNumber={meta?.from ?? 1}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text">
              {meta
                ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} data`
                : 'Menampilkan 0 data'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!canGoPrev}
              >
                Sebelumnya
              </Button>
              <span className="metric-number rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-h">
                Halaman {meta?.currentPage ?? page} / {meta?.lastPage ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => meta && setPage(Math.min(meta.lastPage, page + 1))}
                disabled={!canGoNext}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
