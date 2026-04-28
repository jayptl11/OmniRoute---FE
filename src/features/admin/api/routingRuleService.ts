import { api } from '@/lib/axios';
import type {
  RoutingRuleDto,
  CreateRuleRequest,
  UpdateRuleRequest,
  TestRuleRequest,
  TestRuleResponse,
  ToggleStatusRequest,
} from '@/types/admin';

export const routingRuleService = {
  getRules: () =>
    api.get<RoutingRuleDto[]>('/api/routing-rules').then((r) => r.data),

  createRule: (data: CreateRuleRequest) =>
    api.post<string>('/api/routing-rules', data).then((r) => r.data),

  updateRule: (id: string, data: UpdateRuleRequest) =>
    api.put<void>(`/api/routing-rules/${id}`, data),

  toggleRuleStatus: (id: string, isActive: boolean) =>
    api.patch<void>(`/api/routing-rules/${id}/status`, {
      isActive,
    } satisfies ToggleStatusRequest),

  testRule: (data: TestRuleRequest) =>
    api
      .post<TestRuleResponse>('/api/routing-rules/test', data)
      .then((r) => r.data),
};
