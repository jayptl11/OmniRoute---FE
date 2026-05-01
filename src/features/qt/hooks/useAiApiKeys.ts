import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApiKeyService } from '../api/aiApiKeyService';
import type { AddAiApiKeyRequest, UpdateAiApiKeyRequest } from '@/types/admin';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const qtAiKeys = {
  all: ['qt', 'ai-api-keys'] as const,
  list: () => ['qt', 'ai-api-keys', 'list'] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useAiApiKeys() {
  return useQuery({
    queryKey: qtAiKeys.list(),
    queryFn: () => aiApiKeyService.getAll(),
    staleTime: 30 * 1000, // 30s — failureCount/lastUsedAt thay đổi sau mỗi test
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useAddAiApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddAiApiKeyRequest) => aiApiKeyService.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qtAiKeys.list() });
    },
  });
}

export function useUpdateAiApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAiApiKeyRequest }) =>
      aiApiKeyService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qtAiKeys.list() });
    },
  });
}

export function useToggleAiApiKeyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aiApiKeyService.toggleStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qtAiKeys.list() });
    },
  });
}

export function useTestAiApiKey() {
  return useMutation({
    mutationFn: (id: string) => aiApiKeyService.test(id),
  });
}
