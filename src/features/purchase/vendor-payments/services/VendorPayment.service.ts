import axios from 'axios';
import { env } from '../../../../config/env';
import type {
  VendorPayment,
  VendorPaymentFilterParams,
  PaginatedVendorPayments,
  VendorPaymentCreateResult,
} from '../types/VendorPayment';
import type { VendorPaymentFormValues } from '../schemas/VendorPayment.schemas';
import {
  parseVendorPaymentsResponse,
  parseVendorPaymentResponse,
  parseCreateVendorPaymentResponse,
} from '../schemas/VendorPayment.schemas';

const purchaseApiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const vendorPaymentService = {
  fetchVendorPayments: async (
    page: number,
    perPage = 15,
    filters: VendorPaymentFilterParams = {}
  ): Promise<PaginatedVendorPayments> => {
    const response = await purchaseApiClient.get('/purchase/vendor-payments', {
      params: cleanParams({
        page,
        per_page: perPage,
        q: filters.q,
        vendor_id: filters.vendor_id,
        payment_type: filters.payment_type,
        payment_date_from: filters.payment_date_from,
        payment_date_to: filters.payment_date_to,
        account_id: filters.account_id,
      }),
    });

    return parseVendorPaymentsResponse(response.data, perPage);
  },

  fetchVendorPayment: async (id: string | number): Promise<VendorPayment> => {
    const response = await purchaseApiClient.get(`/purchase/vendor-payments/${id}`, {
      params: {
        with: 'vendor,account',
      },
    });
    return parseVendorPaymentResponse(response.data);
  },

  createVendorPayment: async (payload: VendorPaymentFormValues): Promise<VendorPaymentCreateResult> => {
    const response = await purchaseApiClient.post('/purchase/vendor-payments', payload);
    return parseCreateVendorPaymentResponse(response.data);
  },

  updateVendorPayment: async (id: string | number, payload: Partial<VendorPaymentFormValues>): Promise<VendorPayment> => {
    const response = await purchaseApiClient.put(`/purchase/vendor-payments/${id}`, payload);
    return parseVendorPaymentResponse(response.data);
  },

  deleteVendorPayment: async (id: string | number): Promise<{ message: string }> => {
    const response = await purchaseApiClient.delete(`/purchase/vendor-payments/${id}`);
    return {
      message: response.data.message || 'Pembayaran vendor berhasil dihapus',
    };
  },
};
