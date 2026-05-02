import { isAxiosError } from 'axios';
import { isAppError } from '@/types/common';

export function extractErrorMessage(err: unknown): string {
  if (isAppError(err)) return err.message;

  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data.errors)) {
        const msgs = (data.errors as Array<{ message?: string }>)
          .map((e) => e?.message)
          .filter(Boolean);
        if (msgs.length > 0) return msgs.join('; ');
      }
      if (typeof data.errorMessage === 'string') return data.errorMessage;
      if (typeof data.message === 'string') return data.message;
    }
    if (typeof data === 'string') return data;
  }

  if (err instanceof Error) return err.message;

  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
