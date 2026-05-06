import { useState } from 'react';
import { useTeams, useCreateTeam, useUpdateTeam, useToggleTeamStatus } from '@/features/admin/hooks/useTeams';
import { useUsers } from '@/features/admin/hooks/useUsers';
import { extractErrorMessage } from '@/lib/errors';
import { AssignedGroup } from '@/types/admin';
import type { TeamDto, CreateTeamRequest, UpdateTeamRequest } from '@/types/admin';
import { Plus, Pencil, Power, RefreshCw, X, UserCheck } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';
import { GlassButton, GlassSelect } from '@/components/glass';

const TEAM_TYPES = [
  { label: 'Sale', value: AssignedGroup.Sale },
  { label: 'CSKH', value: AssignedGroup.Cskh },
] as const;

const GROUP_LABEL: Record<string, string> = { Sale: 'Sale', Cskh: 'CSKH', StoreSupport: 'Store Support' };

export function TeamsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const { data: teams = [], isLoading, refetch, isFetching } = useTeams(
    typeFilter !== '' ? { teamType: parseInt(typeFilter, 10) as AssignedGroup } : undefined
  );
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const toggleStatus = useToggleTeamStatus();

  // Lấy danh sách user role TN để populate dropdown gán Team Lead
  const { data: tnUsersPage } = useUsers({ roleName: 'TN', isActive: true, pageSize: 200 });
  const tnUsers = tnUsersPage?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamDto | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ teamName: '', teamType: 0, leaderId: '', storeId: '' });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditTarget(null);
    setForm({ teamName: '', teamType: 0, leaderId: '', storeId: '' });
    setFormOpen(true);
    setError('');
  };

  const openEdit = (team: TeamDto) => {
    setEditTarget(team);
    setForm({
      teamName: team.teamName,
      teamType: AssignedGroup[team.teamType as keyof typeof AssignedGroup] ?? 0,
      leaderId: team.leaderId ?? '',
      storeId: team.storeId ?? '',
    });
    setFormOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!editTarget) {
        const payload: CreateTeamRequest = {
          teamName: form.teamName,
          teamType: form.teamType,
          leaderId: form.leaderId || null,
          storeId: form.storeId || null,
        };
        await createTeam.mutateAsync(payload);
      } else {
        const payload: UpdateTeamRequest = {
          id: editTarget.id,
          teamName: form.teamName,
          leaderId: form.leaderId || null,
          storeId: form.storeId || null,
        };
        await updateTeam.mutateAsync({ id: editTarget.id, data: payload });
      }
      setFormOpen(false);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  const isPending = createTeam.isPending || updateTeam.isPending;

  // Tìm tên TN từ danh sách users (fallback khi API không trả leaderName)
  const getLeaderLabel = (team: TeamDto) => {
    if (team.leaderName) return team.leaderName;
    if (!team.leaderId) return null;
    const found = tnUsers.find((u) => u.userId === team.leaderId);
    return found ? `${found.firstName ?? ''} ${found.lastName ?? ''}`.trim() || found.username : team.leaderId.slice(0, 8) + '...';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Nhóm</h1>
          <p className={styles.subtitle}>Quản lý các nhóm Sale và CSKH trong hệ thống</p>
        </div>
        <GlassButton className={styles.btnPrimary} onClick={openCreate}>
          <Plus size={15} />
          Thêm nhóm
        </GlassButton>
      </div>

      <div className={styles.filters}>
        <GlassSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: '', label: 'Tất cả loại nhóm' },
            ...TEAM_TYPES.map(({ label, value }) => ({ value: String(value), label }))
          ]}
        />
        <GlassButton className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </GlassButton>
        <span className={styles.paginationInfo}>{teams.length} nhóm</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên nhóm</th>
              <th>Loại</th>
              <th>Team Lead</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className={styles.emptyCell}><div className={styles.loadingSpinner} /></td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyCell}>Chưa có nhóm nào</td></tr>
            ) : teams.map((team) => {
              const leaderLabel = getLeaderLabel(team);
              return (
                <tr key={team.id}>
                  <td className={styles.cellBold}>{team.teamName}</td>
                  <td>
                    <span className={styles.rolePill}>{GROUP_LABEL[team.teamType] ?? team.teamType}</span>
                  </td>
                  <td>
                    {leaderLabel ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#374151' }}>
                        <UserCheck size={13} style={{ color: '#d97706' }} />
                        {leaderLabel}
                      </span>
                    ) : (
                      <span className={styles.cellMuted} style={{ fontStyle: 'italic' }}>Chưa gán</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${team.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {team.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className={styles.cellMuted}>{new Date(team.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className={styles.actions}>
                      <GlassButton className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openEdit(team)}>
                        <Pencil size={13} />
                      </GlassButton>
                      <GlassButton
                        className={`${styles.actionBtn} ${team.isActive ? styles.actionDanger : styles.actionSuccess}`}
                        title={team.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        onClick={() => toggleStatus.mutate({ id: team.id, isActive: !team.isActive })}
                        disabled={toggleStatus.isPending}
                      >
                        <Power size={13} />
                      </GlassButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editTarget ? 'Chỉnh sửa nhóm' : 'Thêm nhóm mới'}</h2>
              <GlassButton className={styles.closeBtn} onClick={() => setFormOpen(false)}><X size={16} /></GlassButton>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>

                {/* Tên nhóm */}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="team-name">Tên nhóm *</label>
                  <input id="team-name" className={styles.input} required
                    value={form.teamName} onChange={(e) => set('teamName', e.target.value)} />
                </div>

                {/* Loại nhóm (chỉ khi tạo mới) */}
                {!editTarget && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="team-type">Loại nhóm *</label>
                    <GlassSelect
                      value={String(form.teamType)}
                      onChange={(val) => set('teamType', parseInt(val, 10))}
                      className={styles.selectFullWidth}
                      options={[
                        { value: '0', label: 'Sale' },
                        { value: '1', label: 'CSKH' },
                      ]}
                    />
                  </div>
                )}

                {/* Gán Team Lead */}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="team-leader">
                    Team Lead (TN)
                    {' '}<span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.75rem' }}>— tùy chọn</span>
                  </label>
                  <GlassSelect
                    value={form.leaderId}
                    onChange={(val) => set('leaderId', val)}
                    className={styles.selectFullWidth}
                    options={[
                      { value: '', label: '-- Chưa gán Team Lead --' },
                      ...tnUsers.map(u => ({
                        value: u.userId,
                        label: `${[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username} (@${u.username})`
                      }))
                    ]}
                  />
                  {tnUsers.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>
                      Không có tài khoản TN nào đang hoạt động.
                    </p>
                  )}
                  {form.leaderId && (
                    <p style={{ fontSize: '0.75rem', color: '#d97706', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UserCheck size={13} />
                      Sau khi lưu, Team Lead cần <strong style={{ marginLeft: 2 }}>đăng xuất và đăng nhập lại</strong> để nhận quyền.
                    </p>
                  )}
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}
              </div>
              <div className={styles.dialogFooter}>
                <GlassButton type="button" className={styles.btnSecondary} onClick={() => setFormOpen(false)}>Huỷ</GlassButton>
                <GlassButton type="submit" className={styles.btnPrimary} disabled={isPending}>
                  {isPending ? 'Đang lưu...' : editTarget ? 'Lưu' : 'Thêm nhóm'}
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
