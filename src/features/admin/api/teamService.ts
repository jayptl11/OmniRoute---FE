import { api } from '@/lib/axios';
import type {
  TeamDto,
  GetTeamsParams,
  CreateTeamRequest,
  UpdateTeamRequest,
  ToggleStatusRequest,
} from '@/types/admin';

export const teamService = {
  getTeams: (params?: GetTeamsParams) =>
    api.get<TeamDto[]>('/api/teams', { params }).then((r) => r.data),

  getTeam: (id: string) =>
    api.get<TeamDto>(`/api/teams/${id}`).then((r) => r.data),

  createTeam: (data: CreateTeamRequest) =>
    api.post<string>('/api/teams', data).then((r) => r.data),

  updateTeam: (id: string, data: UpdateTeamRequest) =>
    api.put<void>(`/api/teams/${id}`, data),

  toggleTeamStatus: (id: string, isActive: boolean) =>
    api.patch<void>(`/api/teams/${id}/status`, {
      isActive,
    } satisfies ToggleStatusRequest),
};
