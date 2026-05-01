import { api } from '@/lib/axios';
import type {
  AiApiKeyDto,
  CreateAiApiKeyRequest,
  UpdateAiApiKeyRequest,
  TestAiApiKeyResult,
  TestClassificationRequest,
  TestClassificationResponse,
} from '@/types/admin';

export const aiApiKeyService = {
  // API 1 — Lấy danh sách API keys
  getAll: () =>
    api.get<AiApiKeyDto[]>('/api/ai-api-keys').then((r) => r.data),

  // API 2 — Thêm API key mới
  add: (data: CreateAiApiKeyRequest) =>
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

  // API 6 — Test Lead Classification
  testClassification: (id: string, data: TestClassificationRequest) =>
    api
      .post<TestClassificationResponse>(
        `/api/ai-api-keys/${id}/test-classification`,
        data
      )
      .then((r) => r.data),
};
