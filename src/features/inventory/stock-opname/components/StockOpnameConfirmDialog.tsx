import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';

interface StockOpnameConfirmDialogProps {
  open: boolean;
  isPending: boolean;
  description: string;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function StockOpnameConfirmDialog({ open, isPending, description, error, onCancel, onConfirm }: StockOpnameConfirmDialogProps) {
  return <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !isPending) onCancel(); }}>
    <DialogContent role="alertdialog" onEscapeKeyDown={(event) => { if (isPending) event.preventDefault(); }} onPointerDownOutside={(event) => event.preventDefault()}>
      <DialogHeader>
        <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><AlertTriangle className="h-6 w-6" /></div>
        <DialogTitle>Konfirmasi Penyesuaian Stok</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <p className="my-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-text-h">Pastikan gudang, tanggal opname, dan jumlah fisik setiap produk sudah benar sebelum melanjutkan.</p>
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>Batal</Button>
        <Button type="button" disabled={isPending} onClick={onConfirm}>{isPending ? 'Menyimpan...' : 'Ya, Simpan Stock Opname'}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
