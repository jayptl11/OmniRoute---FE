import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { routingRuleService } from '../api/routingRuleService';
import type { CreateRuleRequest, TestRuleRequest, UpdateRuleRequest } from '@/types/admin';

export const ruleKeys = {
  all: ['routing-rules'] as const,
  list: () => ['routing-rules', 'list'] as const,
};

export function useRoutingRules() {
  return useQuery({
    queryKey: ruleKeys.list(),
    queryFn: routingRuleService.getRules,
  });
}

export function useCreateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRuleRequest) => routingRuleService.createRule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}

export function useUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRuleRequest }) =>
      routingRuleService.updateRule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}

export function useToggleRuleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      routingRuleService.toggleRuleStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}

export function useTestRule() {
  return useMutation({
    mutationFn: (data: TestRuleRequest) => routingRuleService.testRule(data),
  });
}
