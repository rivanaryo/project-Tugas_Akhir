import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { useHorizontalScroll } from '../../../../../hooks/useHorizontalScroll';
import type { FieldArrayWithId, UseFormRegister, FieldErrors } from 'react-hook-form';
import type { CreateGoodReceiptFormInput } from '../../schemas/goodReceipt.schema';

interface GoodReceiptItemsTableProps {
  fields: FieldArrayWithId<CreateGoodReceiptFormInput, 'items', 'id'>[];
  register: UseFormRegister<CreateGoodReceiptFormInput>;
  errors: FieldErrors<CreateGoodReceiptFormInput>;
  remove: (index: number) => void;
}

export function GoodReceiptItemsTable({ fields, register, errors, remove }: GoodReceiptItemsTableProps) {
  const scrollRef = useHorizontalScroll();

  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-h">Good Receipt Items</p>
          <p className="text-sm text-text">Atur qty penerimaan untuk setiap item yang disalin dari Purchase Order.</p>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-border/70 bg-surface-1/80 px-4 py-6 text-sm text-text">
          Tidak ada item. Klik tombol <span className="font-semibold">Salin Purchase Order</span> untuk menambahkan item.
        </div>
      ) : (
        <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
          <table className="min-w-[800px] w-full border-collapse text-left text-sm">
            <thead className="bg-surface-1">
              <tr>
                <th className="border-b border-border px-4 py-3">Produk</th>
                <th className="border-b border-border px-4 py-3">Qty PO</th>
                <th className="border-b border-border px-4 py-3">Qty Diterima</th>
                <th className="border-b border-border px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-border/80 last:border-b-0">
                  <td className="px-4 py-3 align-top">
                    <Input value={field.product_name ?? '-'} readOnly />
                    <input
                      type="hidden"
                      value={field.purchase_order_item_id}
                      {...register(`items.${index}.purchase_order_item_id` as const)}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input value={field.qty_ordered ?? 0} readOnly />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min={0}
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
