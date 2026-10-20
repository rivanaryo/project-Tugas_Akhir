import { Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { useHorizontalScroll } from '../../../../../hooks/useHorizontalScroll';
import type { FieldArrayWithId, UseFormRegister, FieldErrors, UseFieldArrayAppend } from 'react-hook-form';
import type { CreateGoodReceiptFormInput } from '../../schemas/goodReceipt.schema';
import type { PurchaseOrderItemDetail } from '../../../purchase-orders/types/purchaseOrder.types';

interface GoodReceiptItemsTableProps {
  fields: FieldArrayWithId<CreateGoodReceiptFormInput, 'items', 'id'>[];
  register: UseFormRegister<CreateGoodReceiptFormInput>;
  errors: FieldErrors<CreateGoodReceiptFormInput>;
  remove: (index: number) => void;
  append: UseFieldArrayAppend<CreateGoodReceiptFormInput, 'items'>;
  purchaseOrderItems: PurchaseOrderItemDetail[];
  isLoadingItems?: boolean;
  hasPurchaseOrder: boolean;
}

export function GoodReceiptItemsTable({
  fields,
  register,
  errors,
  remove,
  append,
  purchaseOrderItems,
  isLoadingItems,
  hasPurchaseOrder,
}: GoodReceiptItemsTableProps) {
  const scrollRef = useHorizontalScroll();

  const getItemLabel = (item: PurchaseOrderItemDetail) => {
    const productName =
      item.product?.product_name ??
      item.product?.product_name ??
      `Produk ${item.product_id}`;
    return `${productName} (Qty PO: ${item.quantity ?? 0})`;
  };

  const handleAddRow = () => {
    append({ purchase_order_item_id: '', qty_received: 1, product_name: '', qty_ordered: 0 });
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-h">Good Receipt Items</p>
          <p className="text-sm text-text">Pilih item Purchase Order dan isi qty yang diterima.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={handleAddRow}
          disabled={!hasPurchaseOrder || isLoadingItems}
        >
          <Plus className="h-4 w-4" />
          Tambah Item
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-border/70 bg-surface-1/80 px-4 py-6 text-sm text-text">
          Tidak ada item. Klik tombol <span className="font-semibold">Tambah Item</span> atau{' '}
          <span className="font-semibold">Salin Purchase Order</span> untuk menambahkan item.
        </div>
      ) : (
        <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
          <table className="min-w-[800px] w-full border-collapse text-left text-sm">
            <thead className="bg-surface-1">
              <tr>
                <th className="border-b border-border px-4 py-3">Item Purchase Order</th>
                <th className="border-b border-border px-4 py-3">Qty Diterima</th>
                <th className="border-b border-border px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-border/80 last:border-b-0">
                  <td className="px-4 py-3 align-top">
                    <Select {...register(`items.${index}.purchase_order_item_id` as const)}>
                      <option value="">Pilih item PO</option>
                      {purchaseOrderItems.map((item) => (
                        <option key={item.id} value={String(item.id)}>
                          {getItemLabel(item)}
                        </option>
                      ))}
                    </Select>
                    {errors.items?.[index]?.purchase_order_item_id?.message ? (
                      <p className="mt-1 text-xs text-destructive">{errors.items?.[index]?.purchase_order_item_id?.message}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      {...register(`items.${index}.qty_received` as const, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.items?.[index]?.qty_received?.message ? (
                      <p className="mt-1 text-xs text-destructive">{errors.items?.[index]?.qty_received?.message}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Button type="button" variant="secondary" onClick={() => remove(index)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
