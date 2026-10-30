import { useQuery } from '@tanstack/react-query';
import { Select } from '../../../../components/ui/select';
import { sizeChartService } from '../../../masterdata/size-charts/services/sizeChartService';

export function ProductSizeSelect({ productId, value, onChange, error, disabled = false }: {
  productId: string; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean;
}) {
  const query = useQuery({
    queryKey: ['sales-product-sizes', productId],
    queryFn: () => sizeChartService.fetchSizeCharts(1, 100, { product_id: productId }),
    enabled: !!productId && !disabled,
  });
  const sizes = [...new Set((query.data?.items ?? []).filter((item) => String(item.product_id) === productId).map((item) => item.size))];
  return <div className="min-w-36 space-y-1">
    <Select aria-label="Ukuran produk" aria-invalid={!!error} value={value} required disabled={disabled || !productId || query.isFetching || query.isError} onChange={(event) => onChange(event.target.value)}>
      <option value="">{query.isFetching ? 'Memuat...' : 'Pilih ukuran'}</option>
      {value && !sizes.some((size) => size === value) && <option value={value} disabled>{value}</option>}
      {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
    </Select>
    {query.isError && <p role="alert" className="text-xs text-rose-400">Gagal memuat ukuran. <button type="button" onClick={() => void query.refetch()}>Coba lagi</button></p>}
    {!disabled && productId && query.isSuccess && !sizes.length && <p className="text-xs text-text">Tambahkan size chart produk terlebih dahulu.</p>}
    {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
  </div>;
}
