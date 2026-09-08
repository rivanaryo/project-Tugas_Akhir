import axios from 'axios';

export function isServiceUnavailable(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 503;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
    if (isServiceUnavailable(error)) {
      return 'Layanan ML sedang tidak tersedia. Silakan coba lagi beberapa saat.';
    }
    return 'Terjadi kesalahan saat menghubungi server.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
}
