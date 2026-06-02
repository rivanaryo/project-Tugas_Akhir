import axios from 'axios';
import { env } from '../../../config/env';
import type { MasterdataListFilterParams } from '../hooks/useMasterdataListFilters';

const masterdataApiClient = axios.create({
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

export const masterdataExportService = {
  exportMasterdata: async (
    type: 'customers' | 'vendors' | 'accounts' | 'products' | 'categories' | 'units' | 'pricelists',
    filters: MasterdataListFilterParams = {}
  ): Promise<Blob> => {
    const response = await masterdataApiClient.get('/master-data/export', {
      params: cleanParams({
        type,
        q: filters.q,
      }),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
