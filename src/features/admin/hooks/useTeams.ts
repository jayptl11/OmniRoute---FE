import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../api/teamService';
import type { CreateTeamRequest, GetTeamsParams, UpdateTeamRequest } from '@/types/admin';

export const teamKeys = {
  all: ['teams'] as const,
  list: (params?: GetTeamsParams) => ['teams', 'list', params] as const,
  detail: (id: string) => ['teams', 'detail', id] as const,
};

export function useTeams(params?: GetTeamsParams) {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => teamService.getTeams(params),
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamService.getTeam(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamRequest) => teamService.createTeam(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      teamService.updateTeam(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useToggleTeamStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      teamService.toggleTeamStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
