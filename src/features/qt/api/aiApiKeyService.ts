import { api } from '@/lib/axios';
import type {
  AiApiKeyDto,
  AddAiApiKeyRequest,
  UpdateAiApiKeyRequest,
  TestAiApiKeyResult,
} from '@/types/admin';

export const aiApiKeyService = {
  // API 1 — Lấy danh sách API keys
  getAll: () =>
    api.get<AiApiKeyDto[]>('/api/ai-api-keys').then((r) => r.data),

  // API 2 — Thêm API key mới
  add: (data: AddAiApiKeyRequest) =>
    api.post<string>('/api/ai-api-keys', data).then((r) => r.data),

  // API 3 — Cập nhật API key
  update: (id: string, data: UpdateAiApiKeyRequest) =>
    api.put<void>(`/api/ai-api-keys/${id}`, data),

  // API 4 — Bật / tắt API key
  toggleStatus: (id: string) =>
    api.patch<void>(`/api/ai-api-keys/${id}/status`),

  // API 5 — Test API key
  test: (id: string) =>
    api
      .post<TestAiApiKeyResult>(`/api/ai-api-keys/${id}/test`)
      .then((r) => r.data),
};
