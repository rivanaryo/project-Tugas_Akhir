import api from '../../../../lib/api';
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
    const response = await api.get('finance/vendor-payments', {
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
    const response = await api.get(`finance/vendor-payments/${id}`, {
      params: {
        with: 'vendor,account',
      },
    });
    return parseVendorPaymentResponse(response.data);
  },

  createVendorPayment: async (payload: VendorPaymentFormValues): Promise<VendorPaymentCreateResult> => {
    const response = await api.post('finance/vendor-payments', payload);
    return parseCreateVendorPaymentResponse(response.data);
  },

  updateVendorPayment: async (id: string | number, payload: Partial<VendorPaymentFormValues>): Promise<VendorPayment> => {
    const response = await api.put(`finance/vendor-payments/${id}`, payload);
    return parseVendorPaymentResponse(response.data);
  },

  deleteVendorPayment: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`finance/vendor-payments/${id}`);
    return {
      message: response.data.message || 'Pembayaran vendor berhasil dihapus',
    };
  },
};
