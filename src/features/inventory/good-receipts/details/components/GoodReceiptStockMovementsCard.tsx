import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { useStockMovements } from '../../../stock-movement/hooks/useStockMovements';

interface GoodReceiptStockMovementsCardProps {
  grNumber: string;
}

export function GoodReceiptStockMovementsCard({ grNumber }: GoodReceiptStockMovementsCardProps) {
  const { data, isLoading, isError, isFetching } = useStockMovements({
    page: 1,
    perPage: 100,
    filters: { reference_number: grNumber, type: 'in' },
  });

  const movements = data?.items ?? [];

  return (
    <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-h">Stock Movement</p>
          <p className="text-sm text-text">Mutasi stok masuk yang dibuat otomatis dari Good Receipt ini</p>
        </div>
        <p className="text-xs text-text">
          {isFetching ? 'Memuat...' : data?.meta ? `Total ${data.meta.total} mutasi` : ''}
        </p>
      </div>

      <div className="rounded-xl border border-border/80">
        <div className="max-h-[40vh] overflow-auto">
          <table className="min-w-140 w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2">
              <tr>
                <th className="table-head px-4 py-3 font-semibold text-text-h">No</th>
                <th className="table-head px-4 py-3 font-semibold text-text-h">Produk</th>
                <th className="table-head px-4 py-3 font-semibold text-text-h">Tipe</th>
                <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Quantity</th>
                <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Stok Sebelum</th>
                <th className="table-head px-4 py-3 font-semibold text-text-h text-right">Stok Sesudah</th>
              </tr>
            </thead>
            <tbody className="bg-surface-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`sm-skeleton-${index}`} className="border-t border-border/80">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <td key={`sm-skeleton-cell-${index}-${cellIndex}`} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td className="px-4 py-5 text-rose-400" colSpan={6}>Gagal memuat stock movement.</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-text" colSpan={6}>Belum ada stock movement untuk GR ini.</td>
                </tr>
              ) : (
                movements.map((movement, index) => (
                  <tr key={movement.id} className="border-t border-border/80 hover:bg-surface-2/70">
                    <td className="px-4 py-3 text-text">{index + 1}</td>
                    <td className="px-4 py-3 text-text-h">
                      {movement.product?.product_name ?? movement.product_name ?? String(movement.product_id ?? movement.m_products_id ?? '-')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">In</Badge>
                    </td>
                    <td className="metric-number px-4 py-3 text-right font-semibold text-text-h">{movement.quantity}</td>
                    <td className="metric-number px-4 py-3 text-right text-text-h">{movement.stock_before ?? '-'}</td>
                    <td className="metric-number px-4 py-3 text-right text-text-h">{movement.stock_after ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
