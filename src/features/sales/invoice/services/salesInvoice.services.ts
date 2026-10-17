import axios from 'axios';
import api from '../../../../lib/api';
import type {
  PaginatedSalesInvoiceItems,
  PaginatedSalesInvoices,
  SalesInvoiceCreateResult,
  SalesInvoiceFilterParams,
  SalesInvoiceHead,
  SalesInvoiceItemDetail,
} from '../types/salesInvoices';
import {
  parseCreateSalesInvoiceHeadResponse,
  parseSalesInvoiceItemsResponse,
  parseSalesInvoiceResponse,
  parseSalesInvoicesResponse,
  statusToInteger,
} from '../schemas/salesInvoice.schemas';

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    // Convert status to integer for API
    if (key === 'status' && value !== undefined) {
      cleaned[key] = statusToInteger(value as string | boolean | number);
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
};

// Helper untuk prepare sales invoice payload dengan status integer
const prepareSalesInvoicePayload = (payload: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...payload };
  if (result.head && typeof result.head === 'object') {
    const head = result.head as Record<string, unknown>;
    if (head.status !== undefined) {
      head.status = statusToInteger(head.status as string | boolean | number);
    }
  }
  return result;
};

export const salesInvoiceService = {
  fetchSalesInvoices: async (
    page: number,
    perPage = 15,
    filters: SalesInvoiceFilterParams = {}
  ): Promise<PaginatedSalesInvoices> => {
    const params = cleanParams({
      page,
      per_page: perPage,
      q: filters.q,
      status: filters.status,
      customer_id: filters.customer_id,
      invoice_date_from: filters.invoice_date_from,
      invoice_date_to: filters.invoice_date_to,
    });

    try {
      const response = await api.get('/sales/invoices', { params });
      return parseSalesInvoicesResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseSalesInvoicesResponse(error.response.data, perPage);
      }
      throw error;
    }
  },

  fetchSalesInvoice: async (id: string | number): Promise<SalesInvoiceHead> => {
    const response = await api.get(`/sales/invoices/${id}`);
    return parseSalesInvoiceResponse(response.data);
  },

  createSalesInvoice: async (payload: Record<string, unknown>): Promise<SalesInvoiceCreateResult> => {
    const convertedPayload = prepareSalesInvoicePayload(payload);
    const response = await api.post('/sales/invoices', convertedPayload);
    return parseCreateSalesInvoiceHeadResponse(response.data);
  },

  updateSalesInvoice: async (id: string | number, payload: Record<string, unknown>): Promise<SalesInvoiceHead> => {
    const convertedPayload = prepareSalesInvoicePayload(payload);
    const response = await api.put(`/sales/invoices/${id}`, convertedPayload);
    return parseSalesInvoiceResponse(response.data);
  },

  deleteSalesInvoice: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`/sales/invoices/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Sales Invoice deleted successfully' };
  },

  fetchSalesInvoiceItems: async (
    invoiceId: string | number,
    page: number,
    perPage = 15
  ): Promise<PaginatedSalesInvoiceItems> => {
    const params = cleanParams({
      page,
      per_page: perPage,
    });

    try {
      const response = await api.get(`/sales/invoices/${invoiceId}/items`, { params });
      return parseSalesInvoiceItemsResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseSalesInvoiceItemsResponse(error.response.data, perPage);
      }
      throw error;
    }
  },

  fetchSalesInvoiceItem: async (invoiceId: string | number, id: string | number): Promise<SalesInvoiceItemDetail> => {
    const response = await api.get(`/sales/invoices/${invoiceId}/items/${id}`);
    return response.data as SalesInvoiceItemDetail;
  },

  createSalesInvoiceItem: async (invoiceId: string | number, payload: Record<string, unknown>): Promise<unknown> => {
    const response = await api.post(`/sales/invoices/${invoiceId}/items`, payload);
    return response.data;
  },

  updateSalesInvoiceItem: async (invoiceId: string | number, id: string | number, payload: Record<string, unknown>): Promise<unknown> => {
    const response = await api.put(`/sales/invoices/${invoiceId}/items/${id}`, payload);
    return response.data;
  },

  deleteSalesInvoiceItem: async (invoiceId: string | number, id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`/sales/invoices/${invoiceId}/items/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Sales Invoice item deleted successfully' };
  },
};
