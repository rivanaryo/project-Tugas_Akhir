"use no memo";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/dialog';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { useHorizontalScroll } from '../../../../../hooks/useHorizontalScroll';
import type { GoodReceiptItemDetail } from '../../types/goodReceipt.types';
import type { PurchaseOrderItemDetail } from '../../../purchase-orders/types/purchaseOrder.types';
import {
  useCreateGoodReceiptItem,
  useDeleteGoodReceiptItem,
  useUpdateGoodReceiptItem,
} from '../../hooks/useGoodReceiptItemMutations';

interface GoodReceiptItemsEditorProps {
  goodReceiptId: string | number;
  items: GoodReceiptItemDetail[];
  purchaseOrderItems: PurchaseOrderItemDetail[];
  isLoading?: boolean;
}

const getProductName = (item: GoodReceiptItemDetail) =>
  item.product?.product_name ??
  item.purchase_order_item?.pricelist?.product?.product_name ??
  item.purchase_order_item?.pricelist?.product_name ??
  item.purchase_order_item?.product_name ??
  String(item.purchase_order_item?.product_id ?? item.product_id ?? '-');

const getPoItemLabel = (item: PurchaseOrderItemDetail) => {
  const productName =
    item.product?.product_name ??
    item.product?.product_name ??
    `Produk ${item.product_id}`;
  return `${productName} (Qty PO: ${item.quantity ?? 0})`;
};

export function GoodReceiptItemsEditor({ goodReceiptId, items, purchaseOrderItems, isLoading }: GoodReceiptItemsEditorProps) {
  const scrollRef = useHorizontalScroll();
  const createItemMutation = useCreateGoodReceiptItem(goodReceiptId);
  const updateItemMutation = useUpdateGoodReceiptItem(goodReceiptId);
  const deleteItemMutation = useDeleteGoodReceiptItem(goodReceiptId);

  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});
  const [newPoItemId, setNewPoItemId] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [deleteTarget, setDeleteTarget] = useState<GoodReceiptItemDetail | null>(null);

  const usedPoItemIds = new Set(items.map((item) => String(item.purchase_order_item_id)));
  const availablePoItems = purchaseOrderItems.filter((item) => !usedPoItemIds.has(String(item.id)));

  const getDraftQty = (item: GoodReceiptItemDetail) => qtyDrafts[String(item.id)] ?? String(item.qty_received ?? 0);

  const isRowDirty = (item: GoodReceiptItemDetail) => {
    const draft = qtyDrafts[String(item.id)];
    if (draft === undefined) return false;
    return Number(draft) !== Number(item.qty_received ?? 0);
  };

  const handleSaveQty = async (item: GoodReceiptItemDetail) => {
    const qty = Number(getDraftQty(item));
    if (!Number.isFinite(qty) || qty < 1) {
      toast.error('Qty received minimal 1.');
      return;
    }

    try {
      await updateItemMutation.mutateAsync({ itemId: item.id as string | number, data: { qty_received: qty } });
      setQtyDrafts((prev) => {
        const next = { ...prev };
        delete next[String(item.id)];
        return next;
      });
      toast.success('Item berhasil diperbarui.');
    } catch {
      toast.error('Gagal memperbarui item.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteItemMutation.mutateAsync(deleteTarget.id);
      toast.success('Item berhasil dihapus.');
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus item.');
    }
  };

  const handleAddItem = async () => {
    const qty = Number(newQty);
    if (!newPoItemId) {
      toast.error('Pilih item Purchase Order terlebih dahulu.');
      return;
    }
    if (!Number.isFinite(qty) || qty < 1) {
      toast.error('Qty received minimal 1.');
      return;
    }

    try {
      await createItemMutation.mutateAsync({ purchase_order_item_id: newPoItemId, qty_received: qty });
      toast.success('Item berhasil ditambahkan.');
      setNewPoItemId('');
      setNewQty('1');
    } catch {
      toast.error('Gagal menambahkan item.');
    }
  };

  const isMutating = createItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending;

  return (
    <div className="space-y-3">
      <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-border/80 bg-surface-1">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead className="bg-surface-1">
            <tr>
              <th className="border-b border-border px-4 py-3">Produk</th>
              <th className="border-b border-border px-4 py-3">Qty PO</th>
              <th className="border-b border-border px-4 py-3">Qty Diterima</th>
              <th className="border-b border-border px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={4}>Memuat item...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-text" colSpan={4}>Belum ada item.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={String(item.id)} className="border-b border-border/80 last:border-b-0">
                  <td className="px-4 py-3 align-top font-semibold text-text-h">{getProductName(item)}</td>
                  <td className="px-4 py-3 align-top">{item.purchase_order_item?.quantity ?? '-'}</td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={getDraftQty(item)}
                      onChange={(e) => setQtyDrafts((prev) => ({ ...prev, [String(item.id)]: e.target.value }))}
                      disabled={isMutating}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSaveQty(item)}
                        disabled={!isRowDirty(item) || isMutating}
                      >
                        Simpan
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        disabled={isMutating}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-surface-1/80 p-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <p className="mb-1 text-xs text-text">Item Purchase Order</p>
          <Select value={newPoItemId} onChange={(e) => setNewPoItemId(e.target.value)} disabled={isMutating}>
            <option value="">Pilih item PO</option>
            {availablePoItems.map((item) => (
              <option key={item.id} value={String(item.id)}>{getPoItemLabel(item)}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-32">
          <p className="mb-1 text-xs text-text">Qty Diterima</p>
          <Input type="number" min={1} step={1} value={newQty} onChange={(e) => setNewQty(e.target.value)} disabled={isMutating} />
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          onClick={handleAddItem}
          disabled={isMutating || availablePoItems.length === 0}
        >
          <Plus className="h-4 w-4" />
          Tambah Item
        </Button>
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Item</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `Yakin ingin menghapus item "${getProductName(deleteTarget)}"?` : 'Yakin ingin menghapus item ini?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={deleteItemMutation.isPending}>Batal</Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={deleteItemMutation.isPending}>
              {deleteItemMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
