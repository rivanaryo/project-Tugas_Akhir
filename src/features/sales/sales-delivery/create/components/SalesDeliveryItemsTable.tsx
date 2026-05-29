import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { useHorizontalScroll } from '../../../../../hooks/useHorizontalScroll';
  import type { FieldArrayWithId, UseFormRegister, FieldErrors } from 'react-hook-form';
import type { CreateSalesDeliveryFormInput } from '../../schemas/salesDelivery.schemas';

interface SalesDeliveryItemsTableProps {
  fields: FieldArrayWithId<CreateSalesDeliveryFormInput, 'items', 'id'>[];
  register: UseFormRegister<CreateSalesDeliveryFormInput>;
  errors: FieldErrors<CreateSalesDeliveryFormInput>;
  remove: (index: number) => void;
}

export function SalesDeliveryItemsTable({ fields, register, errors, remove }: SalesDeliveryItemsTableProps) {
  const scrollRef = useHorizontalScroll();

  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-h">Sales Delivery Items</p>
          <p className="text-sm text-text">Atur qty pengiriman untuk setiap item yang disalin dari Sales Order.</p>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-border/70 bg-surface-1/80 px-4 py-6 text-sm text-text italic">
          Tidak ada item. Gunakan tombol <span className="font-semibold text-accent">Salin dari Sales Order</span> untuk menambahkan item secara otomatis.
        </div>
      ) : (
        <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
          <table className="min-w-[800px] w-full border-collapse text-left text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="border-b border-border px-4 py-3 font-semibold text-text-h">Produk</th>
                <th className="border-b border-border px-4 py-3 font-semibold text-text-h text-right">Qty SO</th>
                <th className="border-b border-border px-4 py-3 font-semibold text-text-h text-right">Qty Dikirim</th>
                <th className="border-b border-border px-4 py-3 font-semibold text-text-h text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {fields.map((field, index) => {
                const item = field as unknown as { 
                  product_name?: string; 
                  qty_so?: number; 
                };

                return (
                  <tr key={field.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <p className="font-semibold text-text-h">{item.product_name || '-'}</p>
                        <input
                          type="hidden"
                          {...register(`items.${index}.sales_order_item_id` as const)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right font-medium text-text">
                      {item.qty_so ?? 0}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-end">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="w-32 text-right font-bold text-accent"
                          {...register(`items.${index}.qty_delivered` as const, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.items?.[index]?.qty_delivered?.message ? (
                          <p className="mt-1 text-xs text-destructive">{errors.items?.[index]?.qty_delivered?.message}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
