import { useState } from 'react';
import {
  useMasterData,
  useCreateMasterData,
  useUpdateMasterData,
  useToggleMasterDataStatus,
} from '@/features/admin/hooks/useMasterData';
import { getAdminErrorMessage } from '@/features/admin/utils/errorMessages';
import { MasterDataCategory } from '@/types/admin';
import type { MasterDataItemDto, CreateMasterDataRequest, UpdateMasterDataRequest } from '@/types/admin';
import { Plus, Pencil, Eye, EyeOff, RefreshCw, X } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';

const TABS = [
  { label: 'Sản phẩm', value: MasterDataCategory.Product },
  { label: 'Lý do LOST', value: MasterDataCategory.LostReason },
  { label: 'Lý do Huỷ', value: MasterDataCategory.CancelReason },
] as const;

export function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<MasterDataCategory>(MasterDataCategory.Product);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MasterDataItemDto | null>(null);
  const [error, setError] = useState('');

  const { data: items = [], isLoading, refetch, isFetching } = useMasterData({ category: activeTab });
  const createItem = useCreateMasterData();
  const updateItem = useUpdateMasterData();
  const toggleStatus = useToggleMasterDataStatus();

  const [form, setForm] = useState({ code: '', displayName: '', description: '', sortOrder: 1 });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditTarget(null);
    setForm({ code: '', displayName: '', description: '', sortOrder: items.length + 1 });
    setFormOpen(true);
    setError('');
  };

  const openEdit = (item: MasterDataItemDto) => {
    setEditTarget(item);
    setForm({ code: item.code, displayName: item.displayName, description: item.description ?? '', sortOrder: item.sortOrder });
    setFormOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!editTarget) {
        const payload: CreateMasterDataRequest = {
          category: activeTab,
          code: form.code,
          displayName: form.displayName,
          description: form.description || null,
          sortOrder: form.sortOrder,
        };
        await createItem.mutateAsync(payload);
      } else {
        const payload: UpdateMasterDataRequest = {
          displayName: form.displayName,
          description: form.description || null,
          sortOrder: form.sortOrder,
        };
        await updateItem.mutateAsync({ id: editTarget.id, data: payload });
      }
      setFormOpen(false);
    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(getAdminErrorMessage(e?.code ?? ''));
    }
  };

  const handleToggle = async (item: MasterDataItemDto) => {
    try {
      await toggleStatus.mutateAsync({ id: item.id, isActive: !item.isActive });
    } catch (err: unknown) {
      const e = err as { code?: string };
      alert(getAdminErrorMessage(e?.code ?? ''));
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Danh mục hệ thống</h1>
          <p className={styles.subtitle}>Quản lý sản phẩm, lý do LOST và lý do huỷ</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <Plus size={15} />
          Thêm mục
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            id={`master-tab-${value}`}
            className={`${styles.tab} ${activeTab === value ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
        <span className={styles.paginationInfo}>{items.length} mục</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Mã (code)</th>
              <th>Tên hiển thị</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className={styles.emptyCell}><div className={styles.loadingSpinner} /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyCell}>Chưa có mục nào</td></tr>
            ) : (
              [...items].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                <tr key={item.id}>
                  <td className={styles.cellMuted}>{item.sortOrder}</td>
                  <td><span className={styles.rolePill}>{item.code}</span></td>
                  <td className={styles.cellBold}>{item.displayName}</td>
                  <td className={styles.cellMuted}>{item.description ?? '—'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {item.isActive ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openEdit(item)}>
                        <Pencil size={13} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${item.isActive ? styles.actionDanger : styles.actionSuccess}`}
                        title={item.isActive ? 'Ẩn mục này' : 'Hiển thị lại'}
                        onClick={() => handleToggle(item)}
                        disabled={toggleStatus.isPending}
                      >
                        {item.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Dialog */}
      {formOpen && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>
                {editTarget ? 'Chỉnh sửa mục' : 'Thêm mục mới'}
              </h2>
              <button className={styles.closeBtn} onClick={() => setFormOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>
                {!editTarget && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="md-code">Mã (code) *</label>
                    <input id="md-code" className={styles.input} required
                      placeholder="VD: NO_BUDGET"
                      value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="md-name">Tên hiển thị *</label>
                  <input id="md-name" className={styles.input} required
                    value={form.displayName} onChange={(e) => set('displayName', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="md-sort">Thứ tự *</label>
                  <input id="md-sort" type="number" min={1} className={styles.input} required
                    value={form.sortOrder} onChange={(e) => set('sortOrder', parseInt(e.target.value, 10) || 1)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="md-desc">
                    Mô tả <span className={styles.optional}>(tuỳ chọn)</span>
                  </label>
                  <input id="md-desc" className={styles.input}
                    value={form.description} onChange={(e) => set('description', e.target.value)} />
                </div>
                {error && <p className={styles.errorMsg}>{error}</p>}
              </div>
              <div className={styles.dialogFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setFormOpen(false)}>Huỷ</button>
                <button type="submit" className={styles.btnPrimary} disabled={isPending}>
                  {isPending ? 'Đang lưu...' : editTarget ? 'Lưu' : 'Thêm mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
