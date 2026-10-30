import api from '../../../lib/api';
import { z } from 'zod';
import {
  finishedGoodsReceiptInputSchema, finishedGoodsReceiptSchema, receiptListSchema, receiptStatuses,
  type FinishedGoodsReceiptInput, type ReceiptFilters, type ReceiptStatus,
} from './finishedGoodsReceipt.schemas';

const path = '/production/finished-goods-receipts';
export const finishedGoodsReceiptService = {
  async list(page: number, filters: ReceiptFilters) {
    const params = Object.fromEntries(Object.entries({ page, per_page: 15, ...filters }).filter(([, value]) => value !== ''));
    const response = await api.get(path, { params });
    const data = receiptListSchema.parse(response.data.data);
    const perPage = data.per_page ?? 15;
    return { ...data, per_page: perPage, last_page: data.last_page ?? Math.max(1, Math.ceil(data.total / perPage)) };
  },
  async get(id: string) {
    const response = await api.get(`${path}/${id}`);
    return finishedGoodsReceiptSchema.parse(response.data.data);
  },
  async create(input: FinishedGoodsReceiptInput) {
    const response = await api.post(path, finishedGoodsReceiptInputSchema.parse(input));
    return finishedGoodsReceiptSchema.parse(response.data.data);
  },
  async updateStatus(id: string, status: ReceiptStatus) {
    const response = await api.patch(`${path}/${id}`, { status: z.enum(receiptStatuses).parse(status) });
    return finishedGoodsReceiptSchema.parse(response.data.data);
  },
  async remove(id: string) {
    await api.delete(`${path}/${id}`);
  },
};
