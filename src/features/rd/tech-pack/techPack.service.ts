import api from '../../../lib/api';
import type { TechPack, TechPackPayload, TechPackStatus } from './techPack.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedData<T> {
  current_page: number;
  data: T[];
  total: number;
}

export const techPackService = {
  list: async (): Promise<TechPack[]> => {
    const response = await api.get<ApiResponse<PaginatedData<TechPack> | TechPack[]>>('/rd/tech-packs');
    return Array.isArray(response.data.data) ? response.data.data : response.data.data.data;
  },

  detail: async (id: string): Promise<TechPack> => {
    const response = await api.get<ApiResponse<TechPack>>(`/rd/tech-packs/${id}`);
    return response.data.data;
  },

  create: async (payload: TechPackPayload): Promise<TechPack> => {
    const response = await api.post<ApiResponse<TechPack>>('/rd/tech-packs', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<TechPackPayload>): Promise<TechPack> => {
    const response = await api.put<ApiResponse<TechPack>>(`/rd/tech-packs/${id}`, payload);
    return response.data.data;
  },

  updateStatus: async (id: string, status: TechPackStatus): Promise<TechPack> => {
    const response = await api.patch<ApiResponse<TechPack>>(`/rd/tech-packs/${id}/status`, { status });
    return response.data.data;
  },
};
