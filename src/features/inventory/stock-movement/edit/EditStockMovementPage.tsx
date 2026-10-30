"use no memo";

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { stockMovementService } from '../services/stockMovement.service';
import { useUpdateStockMovement } from '../hooks/useUpdateStockMovement';
import { updateStockMovementInputSchema, type UpdateStockMovementInput } from '../schemas/stockMovement.schemas';
import type { StockMovement } from '../types/stockMovement.types';

function MovementEditor({ movement }: { movement: StockMovement }) {
  const navigate = useNavigate();
  const mutation = useUpdateStockMovement();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateStockMovementInput>({
    resolver: zodResolver(updateStockMovementInputSchema),
    defaultValues: { quantity: movement.quantity, description: movement.description ?? '' },
  });
  const submit = async (payload: UpdateStockMovementInput) => {
    setError('');
    try {
      await mutation.mutateAsync({ id: movement.id, payload });
      toast.success('Stock Movement berhasil diperbarui.');
      navigate(`/inventory/stock-movements/${movement.id}`);
    } catch (cause) {
      const message = axios.isAxiosError(cause) ? cause.response?.data?.message ?? 'Gagal memperbarui movement.' : 'Gagal memperbarui movement.';
      setError(message);
      toast.error(message);
    }
  };
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-text">Edit hanya mengubah catatan movement. Backend tidak menghitung ulang stok sebelum/sesudah maupun stok produk. Gunakan Stock Opname untuk penyesuaian stok.</p>
      <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" min={1} step={1} {...register('quantity', { valueAsNumber: true })} />{errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="description">Deskripsi</Label><Input id="description" maxLength={255} {...register('description')} />{errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}</div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button asChild variant="secondary"><Link to="/inventory/stock-movements">Batal</Link></Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></div>
    </form>
  );
}

export function EditStockMovementPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({ queryKey: ['inventory', 'stock-movements', id], queryFn: () => stockMovementService.fetchStockMovement(id!), enabled: !!id });
  if (isLoading) return <p className="p-8 text-center">Memuat stock movement...</p>;
  if (isError || !data) return <p role="alert" className="p-8 text-center text-destructive">Gagal memuat stock movement.</p>;
  return <Card><CardHeader><Link to="/inventory/stock-movements" className="text-sm text-accent">Inventory / Stock Movement</Link><CardTitle>Edit {data.reference_number}</CardTitle><CardDescription>{data.product?.name ?? data.product?.product_name ?? data.product_name} · {data.warehouse?.name ?? data.warehouse_name}</CardDescription></CardHeader><CardContent><MovementEditor key={data.id} movement={data} /></CardContent></Card>;
}
