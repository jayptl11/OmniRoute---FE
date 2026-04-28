import { useState } from 'react';
import { useStores, useCreateStore, useUpdateStore, useToggleStoreStatus } from '@/features/admin/hooks/useStores';
import { getAdminErrorMessage } from '@/features/admin/utils/errorMessages';
import type { StoreDto, CreateStoreRequest, UpdateStoreRequest } from '@/types/admin';
import { Plus, Pencil, Power, RefreshCw, X, MapPin } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';

export function StoresPage() {
  const [regionFilter, setRegionFilter] = useState('');
  const { data: stores = [], isLoading, refetch, isFetching } = useStores(
    regionFilter ? { region: regionFilter } : undefined
  );
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const toggleStatus = useToggleStoreStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreDto | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    storeCode: '', storeName: '', maxCapacity: 30, address: '', region: '', managerId: '',
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditTarget(null);
    setForm({ storeCode: '', storeName: '', maxCapacity: 30, address: '', region: '', managerId: '' });
    setFormOpen(true);
    setError('');
  };

  const openEdit = (store: StoreDto) => {
    setEditTarget(store);
    setForm({
      storeCode: store.storeCode,
      storeName: store.storeName,
      maxCapacity: store.maxCapacity,
      address: store.address ?? '',
      region: store.region ?? '',
      managerId: store.managerId ?? '',
    });
    setFormOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!editTarget) {
        const payload: CreateStoreRequest = {
          storeCode: form.storeCode,
          storeName: form.storeName,
          maxCapacity: form.maxCapacity,
          address: form.address || null,
          region: form.region || null,
          managerId: form.managerId || null,
        };
        await createStore.mutateAsync(payload);
      } else {
        const payload: UpdateStoreRequest = {
          id: editTarget.id,
          storeName: form.storeName,
          maxCapacity: form.maxCapacity,
          address: form.address || null,
          region: form.region || null,
          managerId: form.managerId || null,
        };
        await updateStore.mutateAsync({ id: editTarget.id, data: payload });
      }
      setFormOpen(false);
    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(getAdminErrorMessage(e?.code ?? ''));
    }
  };

  const isPending = createStore.isPending || updateStore.isPending;
  const regions = [...new Set(stores.map((s) => s.region).filter(Boolean))];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cửa hàng</h1>
          <p className={styles.subtitle}>Quản lý danh sách cửa hàng và công suất tiếp nhận</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <Plus size={15} />
          Thêm cửa hàng
        </button>
      </div>

      <div className={styles.filters}>
        <select className={styles.select} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">Tất cả khu vực</option>
          {regions.map((r) => <option key={r!} value={r!}>{r}</option>)}
        </select>
        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
        <span className={styles.paginationInfo}>{stores.length} cửa hàng</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên cửa hàng</th>
              <th>Khu vực</th>
              <th>Công suất</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className={styles.emptyCell}><div className={styles.loadingSpinner} /></td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyCell}>Chưa có cửa hàng nào</td></tr>
            ) : stores.map((store) => (
              <tr key={store.id}>
                <td><span className={styles.rolePill}>{store.storeCode}</span></td>
                <td>
                  <p className={styles.cellBold}>{store.storeName}</p>
                  {store.address && (
                    <p className={styles.cellMuted} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={10} />{store.address}
                    </p>
                  )}
                </td>
                <td className={styles.cellMuted}>{store.region ?? '—'}</td>
                <td>{store.maxCapacity}</td>
                <td>
                  <span className={`${styles.statusBadge} ${store.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {store.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </td>
                <td className={styles.cellMuted}>
                  {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openEdit(store)}>
                      <Pencil size={13} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${store.isActive ? styles.actionDanger : styles.actionSuccess}`}
                      title={store.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      onClick={() => toggleStatus.mutate({ id: store.id, isActive: !store.isActive })}
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
              <h2 className={styles.dialogTitle}>{editTarget ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng'}</h2>
              <button className={styles.closeBtn} onClick={() => setFormOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>
                {!editTarget && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-code">Mã cửa hàng *</label>
                    <input id="store-code" className={styles.input} required
                      value={form.storeCode} onChange={(e) => set('storeCode', e.target.value)} />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="store-name">Tên cửa hàng *</label>
                  <input id="store-name" className={styles.input} required
                    value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-capacity">Công suất *</label>
                    <input id="store-capacity" type="number" min={1} className={styles.input} required
                      value={form.maxCapacity} onChange={(e) => set('maxCapacity', parseInt(e.target.value, 10) || 1)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-region">Khu vực</label>
                    <input id="store-region" className={styles.input}
                      value={form.region} onChange={(e) => set('region', e.target.value)} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="store-address">Địa chỉ</label>
                  <input id="store-address" className={styles.input}
                    value={form.address} onChange={(e) => set('address', e.target.value)} />
                </div>
                {error && <p className={styles.errorMsg}>{error}</p>}
              </div>
              <div className={styles.dialogFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setFormOpen(false)}>Huỷ</button>
                <button type="submit" className={styles.btnPrimary} disabled={isPending}>
                  {isPending ? 'Đang lưu...' : editTarget ? 'Lưu' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
