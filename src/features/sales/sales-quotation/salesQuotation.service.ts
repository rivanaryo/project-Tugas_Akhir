import api from '../../../lib/api';
import { parseSalesOrderResponse } from '../sales-order/schemas/salesOrder.schemas';
import {
  quotationHeadInputSchema, quotationItemInputSchema, quotationItemSchema,
  quotationListSchema, quotationSchema,
  type QuotationFilters, type QuotationHeadInput, type QuotationItemInput,
} from './salesQuotation.schemas';

const path = '/sales/sales-quotations';
const headPayload = (input: QuotationHeadInput) => {
  const value = quotationHeadInputSchema.parse(input);
  return { ...value, valid_until: value.valid_until || undefined };
};

export const salesQuotationService = {
  async convertToOrder(id: string) {
    const response = await api.post(`${path}/${id}/convert-to-order`);
    return parseSalesOrderResponse(response.data);
  },
  async list(page: number, filters: QuotationFilters) {
    const params = Object.fromEntries(Object.entries({ page, per_page: 15, ...filters }).filter(([, value]) => value !== ''));
    const response = await api.get(path, { params });
    return quotationListSchema.parse(response.data.data);
  },
  async get(id: string) {
    const response = await api.get(`${path}/${id}`);
    return quotationSchema.parse(response.data.data);
  },
  async create(input: QuotationHeadInput) {
    const response = await api.post(path, headPayload(input));
    return quotationSchema.parse(response.data.data);
  },
  async update(id: string, input: QuotationHeadInput) {
    const response = await api.put(`${path}/${id}`, headPayload(input));
    return quotationSchema.parse(response.data.data);
  },
  async remove(id: string) {
    await api.delete(`${path}/${id}`);
  },
  async items(id: string) {
    const response = await api.get(`${path}/${id}/items`);
    return quotationItemSchema.array().parse(response.data.data);
  },
  async saveItem(id: string, input: QuotationItemInput, itemId?: string) {
    const payload = quotationItemInputSchema.parse(input);
    if (itemId) await api.put(`${path}/${id}/items/${itemId}`, payload);
    else await api.post(`${path}/${id}/items`, payload);
  },
  async removeItem(id: string, itemId: string) {
    await api.delete(`${path}/${id}/items/${itemId}`);
  },
};
