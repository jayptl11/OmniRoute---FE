import { useState, useEffect, useRef } from 'react';
import {
  useStores,
  useCreateStore,
  useUpdateStore,
  useToggleStoreStatus,
  useSearchStoreManagers,
} from '@/features/admin/hooks/useStores';
import type { StoreDto, GetStoresParams, StoreManagerDto } from '@/types/admin';
import { Plus, Pencil, Power, RefreshCw, X, MapPin, Search, AlertTriangle } from 'lucide-react';
import { GooglePlacesInput } from '@/components/GooglePlacesInput';
import styles from '../UsersPage/UsersPage.module.css';

// ── ManagerAutocomplete ────────────────────────────────────────────────────────

interface ManagerAutocompleteProps {
  value: string;           // username hiện tại
  displayName: string;     // label hiển thị (fullName)
  onChange: (username: string, displayName: string) => void;
  onClear: () => void;
}

function ManagerAutocomplete({ value, displayName, onChange, onClear }: ManagerAutocompleteProps) {
  const [inputVal, setInputVal] = useState(displayName);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isFetching } = useSearchStoreManagers(debouncedQ || undefined);

  // Sync khi form reset
  useEffect(() => { setInputVal(displayName); }, [displayName]);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebouncedQ(inputVal), 300);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [inputVal]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (m: StoreManagerDto) => {
    onChange(m.username, m.fullName);
    setInputVal(m.fullName);
    setOpen(false);
  };

  const handleClear = () => {
    setInputVal('');
    setDebouncedQ('');
    onClear();
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          className={styles.input}
          placeholder="Tìm theo tên hoặc username..."
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {value && (
          <button type="button" className={styles.btnIcon} onClick={handleClear} title="Xóa quản lý">
            <X size={13} />
          </button>
        )}
      </div>
      {open && (inputVal.length > 0 || results.length > 0) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
          borderRadius: 8, marginTop: 4, maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {isFetching && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--color-text-muted)' }}>
              Đang tìm...
            </div>
          )}
          {!isFetching && results.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--color-text-muted)' }}>
              Không tìm thấy kết quả.
            </div>
          )}
          {results.map((m) => (
            <button
              key={m.userId}
              type="button"
              onClick={() => handleSelect(m)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text)' }}>
                  {m.fullName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  @{m.username}
                  {m.hasStore && m.currentStore && (
                    <span style={{ color: '#f59e0b', marginLeft: 6 }}>
                      · đang quản lý: {m.currentStore}
                    </span>
                  )}
                </div>
              </div>
              {m.hasStore && (
                <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StoresPage ─────────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, { field: 'storeCode' | 'manager' | 'general'; msg: string }> = {
  CODE_TAKEN:            { field: 'storeCode',  msg: 'Mã cửa hàng đã tồn tại.' },
  MANAGER_NOT_FOUND:     { field: 'manager',    msg: 'Không tìm thấy người dùng với username này.' },
  INVALID_MANAGER_ROLE:  { field: 'manager',    msg: 'Chỉ có thể gán QL làm quản lý cửa hàng.' },
  MANAGER_INACTIVE:      { field: 'manager',    msg: 'Tài khoản QL đã bị khóa, không thể gán.' },
  NOT_FOUND:             { field: 'general',    msg: 'Không tìm thấy cửa hàng.' },
  ID_MISMATCH:           { field: 'general',    msg: 'Lỗi ID không khớp — kiểm tra lại code.' },
};

const BLANK_FORM = {
  storeCode: '', storeName: '', maxCapacity: 30, address: '', region: '',
  managerUsername: '', managerDisplayName: '',
};

export function StoresPage() {
  const [filterParams, setFilterParams] = useState<GetStoresParams>({});
  const [searchInput, setSearchInput] = useState('');

  const { data: stores = [], isLoading, refetch, isFetching } = useStores(
    Object.keys(filterParams).length ? filterParams : undefined
  );
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const toggleStatus = useToggleStoreStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreDto | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [fieldErrors, setFieldErrors] = useState<{ storeCode?: string; manager?: string; general?: string }>({});

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...BLANK_FORM });
    setFieldErrors({});
    setFormOpen(true);
  };

  const openEdit = (store: StoreDto) => {
    setEditTarget(store);
    setForm({
      storeCode: store.storeCode,
      storeName: store.storeName,
      maxCapacity: store.maxCapacity,
      address: store.address ?? '',
      region: store.region ?? '',
      managerUsername: store.managerUsername ?? '',
      managerDisplayName: store.managerName ?? '',
    });
    setFieldErrors({});
    setFormOpen(true);
  };

  const handleSearch = () => {
    setFilterParams((p) => ({ ...p, search: searchInput || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      if (!editTarget) {
        await createStore.mutateAsync({
          storeCode: form.storeCode,
          storeName: form.storeName,
          maxCapacity: form.maxCapacity,
          address: form.address || null,
          region: form.region || null,
          managerUsername: form.managerUsername || null,
        });
      } else {
        await updateStore.mutateAsync({
          id: editTarget.id,
          data: {
            id: editTarget.id,
            storeName: form.storeName,
            maxCapacity: form.maxCapacity,
            address: form.address || null,
            region: form.region || null,
            managerUsername: form.managerUsername || null,
          },
        });
      }
      setFormOpen(false);
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode ?? '';
      const mapped = ERROR_MESSAGES[code];
      if (mapped) {
        setFieldErrors({ [mapped.field]: mapped.msg });
      } else {
        setFieldErrors({ general: 'Có lỗi xảy ra, vui lòng thử lại.' });
      }
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

      {/* Filters */}
      <div className={styles.filters}>
        <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--color-border)', borderRadius: 7, overflow: 'hidden', background: 'var(--color-bg)', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ margin: 'auto 8px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            className={styles.input}
            style={{ border: 'none', borderRadius: 0, flex: 1 }}
            placeholder="Tìm tên hoặc mã cửa hàng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className={styles.btnIcon} style={{ borderLeft: '1.5px solid var(--color-border)', borderRadius: 0 }} onClick={handleSearch}>
            Tìm
          </button>
        </div>

        <select
          className={styles.select}
          value={filterParams.region ?? ''}
          onChange={(e) => setFilterParams((p) => ({ ...p, region: e.target.value || undefined }))}
        >
          <option value="">Tất cả khu vực</option>
          {regions.map((r) => <option key={r!} value={r!}>{r}</option>)}
        </select>

        <select
          className={styles.select}
          value={filterParams.isActive === undefined ? '' : String(filterParams.isActive)}
          onChange={(e) => setFilterParams((p) => ({
            ...p,
            isActive: e.target.value === '' ? undefined : e.target.value === 'true',
          }))}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Vô hiệu</option>
        </select>

        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
        <span className={styles.paginationInfo}>{stores.length} cửa hàng</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên cửa hàng</th>
              <th>Khu vực</th>
              <th>Quản lý (QL)</th>
              <th>Công suất</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className={styles.emptyCell}><div className={styles.loadingSpinner} /></td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={8} className={styles.emptyCell}>Chưa có cửa hàng nào</td></tr>
            ) : stores.map((store) => (
              <tr key={store.id} style={store.isActive ? undefined : { opacity: 0.5 }}>
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
                <td>
                  {store.managerName ? (
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        {store.managerName}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                        @{store.managerUsername}
                      </p>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: 'rgba(234,179,8,0.1)', color: '#ca8a04',
                    }}>
                      Chưa có quản lý
                    </span>
                  )}
                </td>
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

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editTarget ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng'}</h2>
              <button className={styles.closeBtn} onClick={() => setFormOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>

                {/* storeCode — disabled on edit */}
                {!editTarget && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-code">Mã cửa hàng *</label>
                    <input id="store-code" className={styles.input} required
                      value={form.storeCode} onChange={(e) => set('storeCode', e.target.value)} />
                    {fieldErrors.storeCode && <p className={styles.errorMsg}>{fieldErrors.storeCode}</p>}
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
                      value={form.maxCapacity}
                      onChange={(e) => set('maxCapacity', parseInt(e.target.value, 10) || 1)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-region">Khu vực</label>
                    <input id="store-region" className={styles.input}
                      value={form.region} onChange={(e) => set('region', e.target.value)} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="store-address">Địa chỉ</label>
                  <GooglePlacesInput
                    id="store-address"
                    className={styles.input}
                    value={form.address}
                    onChange={(val) => set('address', val)}
                    placeholder="123 Đường ABC, Quận X, TP.HCM"
                  />
                </div>

                {/* Manager autocomplete */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Quản lý (QL)</label>
                  <ManagerAutocomplete
                    value={form.managerUsername}
                    displayName={form.managerDisplayName}
                    onChange={(username, displayName) => setForm((f) => ({ ...f, managerUsername: username, managerDisplayName: displayName }))}
                    onClear={() => setForm((f) => ({ ...f, managerUsername: '', managerDisplayName: '' }))}
                  />
                  {fieldErrors.manager && <p className={styles.errorMsg}>{fieldErrors.manager}</p>}
                  {form.managerUsername && (
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Đã chọn: <strong>@{form.managerUsername}</strong>
                    </p>
                  )}
                </div>

                {fieldErrors.general && <p className={styles.errorMsg}>{fieldErrors.general}</p>}
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
