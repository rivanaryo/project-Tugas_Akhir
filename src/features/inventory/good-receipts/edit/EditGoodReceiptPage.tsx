"use no memo";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { GoodReceiptItemsTable } from '../components/GoodReceiptItemsTable';
import { useGoodReceipt } from '../hooks/useGoodReceipt';
import { useGoodReceiptItems } from '../hooks/useGoodReceiptItems';
import { useUpdateGoodReceipt } from '../hooks/useUpdateGoodReceipt';
import { updateGoodReceiptHeadInputSchema, type UpdateGoodReceiptHeadInput } from '../schemas/goodReceipt.schema';

interface GoodReceiptApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const formatDateInput = (value: string) => {
  if (!value) return '';
  if (value.includes('T')) return value.slice(0, 10);
  return value;
};

export function EditGoodReceiptPage() {
  "use no memo";

  const { goodReceiptId } = useParams();
  const navigate = useNavigate();
  const updateMutation = useUpdateGoodReceipt();

  const [formError, setFormError] = useState<string | null>(null);

  const { data: goodReceipt, isLoading: isHeadLoading, isError: isHeadError } = useGoodReceipt(goodReceiptId);
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError, isFetching: isItemsFetching } =
    useGoodReceiptItems({
      goodReceiptId,
      page: 1,
      perPage: 100,
    });

  const items = itemsData?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateGoodReceiptHeadInput>({
    resolver: zodResolver(updateGoodReceiptHeadInputSchema),
    defaultValues: {
      gr_number: '',
      purchase_order_id: '',
      vendor_id: '',
      receipt_date: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!goodReceipt) return;
    reset({
      gr_number: String(goodReceipt.gr_number ?? ''),
      purchase_order_id: String(goodReceipt.purchase_order_id ?? ''),
      vendor_id: String(goodReceipt.vendor_id ?? ''),
      receipt_date: formatDateInput(goodReceipt.receipt_date),
      status: goodReceipt.status,
    });
  }, [goodReceipt, reset]);

  const onSubmit = async (values: UpdateGoodReceiptHeadInput) => {
    if (!goodReceiptId) return;

    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: goodReceiptId, data: values });
      toast.success('Good Receipt berhasil diperbarui');
      navigate(`/inventory/good-receipts/${goodReceiptId}`);
    } catch (error) {
      if (axios.isAxiosError<GoodReceiptApiErrorResponse>(error)) {
        const apiMessage = error.response?.data?.message;
        if (apiMessage) {
          setFormError(apiMessage);
          toast.error(apiMessage);
          return;
        }
      }

      const fallbackMessage = 'Gagal memperbarui Good Receipt. Silakan coba lagi.';
      setFormError(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inventory/purchase-orders">Purchase</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inventory/good-receipts">Good Receipts</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-1">
          <CardTitle>Edit Good Receipt</CardTitle>
          <CardDescription>Ubah data head Good Receipt. Nomor GR, PO, dan Vendor tidak bisa diubah.</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isHeadError ? (
          <p className="text-sm text-red-600">Gagal memuat data good receipt.</p>
        ) : isHeadLoading || !goodReceipt ? (
          <p className="text-sm text-text">Loading good receipt...</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('gr_number')} />
            <input type="hidden" {...register('purchase_order_id')} />
            <input type="hidden" {...register('vendor_id')} />

            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-h">Head</p>
                  <p className="text-sm text-text">Informasi utama Good Receipt</p>
                </div>
                {goodReceipt.status === 'delivered' ? (
                  <Badge variant="success">Delivered</Badge>
                ) : goodReceipt.status === 'approved' ? (
                  <Badge variant="warning">Approved</Badge>
                ) : goodReceipt.status === 'cancelled' ? (
                  <Badge variant="danger">Cancelled</Badge>
                ) : (
                  <Badge variant="default">Draft</Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gr-number">Nomor GR</Label>
                  <Input id="gr-number" value={goodReceipt.gr_number} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="po-number">Nomor PO</Label>
                  <Input
                    id="po-number"
                    value={goodReceipt.purchase_order?.po_number ?? String(goodReceipt.purchase_order_id ?? '-')}
                    disabled
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="vendor-name">Vendor</Label>
                  <Input
                    id="vendor-name"
                    value={goodReceipt.vendor?.vendor_name ?? String(goodReceipt.vendor_id ?? '-')}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt-date">Tanggal Receipt</Label>
                  <Input id="receipt-date" type="date" {...register('receipt_date')} />
                  {errors.receipt_date?.message ? (
                    <p className="text-sm text-destructive">{errors.receipt_date.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" {...register('status')}>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  {errors.status?.message ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
                </div>

                {formError ? <p className="text-sm text-destructive md:col-span-2">{formError}</p> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-h">Good Receipt Items</p>
                  <p className="text-sm text-text">Item bersifat read only. Perubahan item dilakukan dari proses receipt yang baru.</p>
                </div>
                <p className="text-xs text-text">{isItemsFetching ? 'Memuat...' : itemsData?.meta ? `Total ${itemsData.meta.total} item` : ''}</p>
              </div>

              <GoodReceiptItemsTable
                data={items}
                isLoading={isItemsLoading}
                isError={isItemsError}
                rowStartNumber={itemsData?.meta.from ?? 1}
              />
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => navigate(`/inventory/good-receipts/${goodReceiptId}`)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
                {isSubmitting || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
