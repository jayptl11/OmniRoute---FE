import { useState } from 'react';
import { useTeams, useCreateTeam, useUpdateTeam, useToggleTeamStatus } from '@/features/admin/hooks/useTeams';
import { getAdminErrorMessage } from '@/features/admin/utils/errorMessages';
import { AssignedGroup } from '@/types/admin';
import type { TeamDto, CreateTeamRequest, UpdateTeamRequest } from '@/types/admin';
import { Plus, Pencil, Power, RefreshCw, X } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';

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
      const e = err as { code?: string };
      setError(getAdminErrorMessage(e?.code ?? ''));
    }
  };

  const isPending = createTeam.isPending || updateTeam.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Nhóm</h1>
          <p className={styles.subtitle}>Quản lý các nhóm Sale và CSKH trong hệ thống</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <Plus size={15} />
          Thêm nhóm
        </button>
      </div>

      <div className={styles.filters}>
        <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tất cả loại nhóm</option>
          {TEAM_TYPES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
        <span className={styles.paginationInfo}>{teams.length} nhóm</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên nhóm</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className={styles.emptyCell}><div className={styles.loadingSpinner} /></td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan={5} className={styles.emptyCell}>Chưa có nhóm nào</td></tr>
            ) : teams.map((team) => (
              <tr key={team.id}>
                <td className={styles.cellBold}>{team.teamName}</td>
                <td>
                  <span className={styles.rolePill}>{GROUP_LABEL[team.teamType] ?? team.teamType}</span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${team.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {team.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </td>
                <td className={styles.cellMuted}>{new Date(team.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openEdit(team)}>
                      <Pencil size={13} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${team.isActive ? styles.actionDanger : styles.actionSuccess}`}
                      title={team.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      onClick={() => toggleStatus.mutate({ id: team.id, isActive: !team.isActive })}
                      disabled={toggleStatus.isPending}
                    >
                      <Power size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editTarget ? 'Chỉnh sửa nhóm' : 'Thêm nhóm mới'}</h2>
              <button className={styles.closeBtn} onClick={() => setFormOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="team-name">Tên nhóm *</label>
                  <input id="team-name" className={styles.input} required
                    value={form.teamName} onChange={(e) => set('teamName', e.target.value)} />
                </div>
                {!editTarget && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="team-type">Loại nhóm *</label>
                    <select id="team-type" className={styles.input} required
                      value={form.teamType} onChange={(e) => set('teamType', parseInt(e.target.value, 10))}>
                      <option value={0}>Sale</option>
                      <option value={1}>CSKH</option>
                    </select>
                  </div>
                )}
                {error && <p className={styles.errorMsg}>{error}</p>}
              </div>
              <div className={styles.dialogFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setFormOpen(false)}>Huỷ</button>
                <button type="submit" className={styles.btnPrimary} disabled={isPending}>
                  {isPending ? 'Đang lưu...' : editTarget ? 'Lưu' : 'Thêm nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
