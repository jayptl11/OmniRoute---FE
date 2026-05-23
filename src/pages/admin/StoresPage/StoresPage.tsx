import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Pencil, Power, RefreshCw, X, MapPin, Search } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import { GooglePlacesInput } from '@/components/GooglePlacesInput';
import { GlassButton, GlassSelect } from '@/components/glass';
import {
  useCreateStore,
  useSearchStoreManagers,
  useStores,
  useToggleStoreStatus,
  useUpdateStore,
} from '@/features/admin/hooks/useStores';
import { extractErrorMessage } from '@/lib/errors';
import type { GetStoresParams, StoreDto, StoreManagerDto } from '@/types/admin';
import styles from '../UsersPage/UsersPage.module.css';

const ERROR_FIELDS: Record<string, 'storeCode' | 'manager' | 'general'> = {
  CODE_TAKEN: 'storeCode',
  MANAGER_NOT_FOUND: 'manager',
  INVALID_MANAGER_ROLE: 'manager',
  MANAGER_INACTIVE: 'manager',
  NOT_FOUND: 'general',
  ID_MISMATCH: 'general',
};

const BLANK_FORM = {
  storeCode: '',
  storeName: '',
  maxCapacity: 30,
  address: '',
  region: '',
  managerUsername: '',
  managerDisplayName: '',
};

function toManagerOption(manager: StoreManagerDto): SearchableUserPickerOption<StoreManagerDto> {
  return {
    value: manager.username,
    label: manager.fullName,
    subLabel: `@${manager.username}`,
    note: manager.hasStore && manager.currentStore ? `Đang quản lý: ${manager.currentStore}` : undefined,
    raw: manager,
  };
}

export function StoresPage() {
  const [filterParams, setFilterParams] = useState<GetStoresParams>({});
  const [searchInput, setSearchInput] = useState('');

  const { data: stores = [], isLoading, refetch, isFetching } = useStores(
    Object.keys(filterParams).length ? filterParams : undefined,
  );
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const toggleStatus = useToggleStoreStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreDto | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [fieldErrors, setFieldErrors] = useState<{ storeCode?: string; manager?: string; general?: string }>({});
  const [managerQuery, setManagerQuery] = useState('');
  const [managerPickerOpen, setManagerPickerOpen] = useState(false);

  const { data: managerResults = [], isFetching: isFetchingManagers } = useSearchStoreManagers(
    managerQuery || undefined,
    formOpen && managerPickerOpen,
  );

  const selectedManager = useMemo<SearchableUserPickerOption<StoreManagerDto> | null>(() => {
    if (!form.managerUsername) {
      return null;
    }

    return {
      value: form.managerUsername,
      label: form.managerDisplayName || `@${form.managerUsername}`,
      subLabel: `@${form.managerUsername}`,
      raw: {
        userId: '',
        fullName: form.managerDisplayName || form.managerUsername,
        username: form.managerUsername,
        hasStore: false,
        currentStore: null,
      },
    };
  }, [form.managerDisplayName, form.managerUsername]);

  const setField = (key: keyof typeof BLANK_FORM, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...BLANK_FORM });
    setFieldErrors({});
    setManagerQuery('');
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
    setManagerQuery('');
    setFormOpen(true);
  };

  const handleSearch = () => {
    setFilterParams((current) => ({ ...current, search: searchInput || undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
      const code = (err as { code?: string })?.code ?? '';
      const field = ERROR_FIELDS[code];
      const message = extractErrorMessage(err);

      if (field) {
        setFieldErrors({ [field]: message });
        return;
      }

      setFieldErrors({ general: message });
    }
  };

  const isPending = createStore.isPending || updateStore.isPending;
  const regions = [...new Set(stores.map((store) => store.region).filter(Boolean))];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cửa hàng</h1>
          <p className={styles.subtitle}>Quản lý danh sách cửa hàng và công suất tiếp nhận</p>
        </div>
        <GlassButton className={styles.btnPrimary} onClick={openCreate}>
          <Plus size={15} />
          Thêm cửa hàng
        </GlassButton>
      </div>

      <div className={styles.filters}>
        <div
          style={{
            display: 'flex',
            gap: 0,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 8,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(24px)',
            flex: 1,
            maxWidth: 300,
          }}
        >
          <Search size={14} style={{ margin: 'auto 8px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            className={styles.input}
            style={{ border: 'none', borderRadius: 0, flex: 1 }}
            placeholder="Tìm tên hoặc mã cửa hàng..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
          />
          <GlassButton
            className={styles.btnIcon}
            style={{ borderLeft: '1.5px solid var(--color-border)', borderRadius: 0 }}
            onClick={handleSearch}
          >
            Tìm
          </GlassButton>
        </div>

        <GlassSelect
          value={filterParams.region ?? ''}
          onChange={(value) => setFilterParams((current) => ({ ...current, region: value || undefined }))}
          options={[{ value: '', label: 'Tất cả khu vực' }, ...regions.map((region) => ({ value: region!, label: region! }))]}
        />

        <GlassSelect
          value={filterParams.isActive === undefined ? '' : String(filterParams.isActive)}
          onChange={(value) =>
            setFilterParams((current) => ({
              ...current,
              isActive: value === '' ? undefined : value === 'true',
            }))
          }
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'true', label: 'Đang hoạt động' },
            { value: 'false', label: 'Vô hiệu' },
          ]}
        />

        <GlassButton className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </GlassButton>
        <span className={styles.paginationInfo}>{stores.length} cửa hàng</span>
      </div>

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
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.loadingSpinner} />
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  Chưa có cửa hàng nào
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id} style={store.isActive ? undefined : { opacity: 0.5 }}>
                  <td>
                    <span className={styles.rolePill}>{store.storeCode}</span>
                  </td>
                  <td>
                    <p className={styles.cellBold}>{store.storeName}</p>
                    {store.address && (
                      <p className={styles.cellMuted} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={10} />
                        {store.address}
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
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>@{store.managerUsername}</p>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: 'rgba(234,179,8,0.1)',
                          color: '#ca8a04',
                        }}
                      >
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
                  <td className={styles.cellMuted}>{new Date(store.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className={styles.actions}>
                      <GlassButton className={styles.actionBtn} title="Chỉnh sửa" onClick={() => openEdit(store)}>
                        <Pencil size={13} />
                      </GlassButton>
                      <GlassButton
                        className={`${styles.actionBtn} ${store.isActive ? styles.actionDanger : styles.actionSuccess}`}
                        title={store.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        onClick={() => toggleStatus.mutate({ id: store.id, isActive: !store.isActive })}
                        disabled={toggleStatus.isPending}
                      >
                        <Power size={13} />
                      </GlassButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editTarget ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng'}</h2>
              <GlassButton type="button" className={styles.closeBtn} onClick={() => setFormOpen(false)}>
                <X size={16} />
              </GlassButton>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.dialogBody}>
                {!editTarget && (
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-code">
                      Mã cửa hàng *
                    </label>
                    <input
                      id="store-code"
                      className={styles.input}
                      required
                      value={form.storeCode}
                      onChange={(event) => setField('storeCode', event.target.value)}
                    />
                    {fieldErrors.storeCode && <p className={styles.errorMsg}>{fieldErrors.storeCode}</p>}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="store-name">
                    Tên cửa hàng *
                  </label>
                  <input
                    id="store-name"
                    className={styles.input}
                    required
                    value={form.storeName}
                    onChange={(event) => setField('storeName', event.target.value)}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-capacity">
                      Công suất *
                    </label>
                    <input
                      id="store-capacity"
                      type="number"
                      min={1}
                      className={styles.input}
                      required
                      value={form.maxCapacity}
                      onChange={(event) => setField('maxCapacity', parseInt(event.target.value, 10) || 1)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="store-region">
                      Khu vực
                    </label>
                    <input
                      id="store-region"
                      className={styles.input}
                      value={form.region}
                      onChange={(event) => setField('region', event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="store-address">
                    Địa chỉ
                  </label>
                  <GooglePlacesInput
                    id="store-address"
                    className={styles.input}
                    value={form.address}
                    onChange={(value) => setField('address', value)}
                    placeholder="123 Đường ABC, Quận X, TP.HCM"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Quản lý (QL)</label>
                  <SearchableUserPicker
                    mode="remote"
                    placeholder="Tìm theo tên hoặc username..."
                    options={managerResults.map(toManagerOption)}
                    selectedOption={selectedManager}
                    onChange={(option) => {
                      setForm((current) => ({
                        ...current,
                        managerUsername: option?.value ?? '',
                        managerDisplayName: option?.raw.fullName ?? '',
                      }));
                    }}
                    onSearch={setManagerQuery}
                    onOpenChange={setManagerPickerOpen}
                    isLoading={isFetchingManagers}
                    fetchOnOpen
                    emptyMessage="Không tìm thấy kết quả."
                    showSelectionSummary
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
                <GlassButton type="button" className={styles.btnSecondary} onClick={() => setFormOpen(false)}>
                  Hủy
                </GlassButton>
                <GlassButton type="submit" className={styles.btnPrimary} disabled={isPending}>
                  {isPending ? 'Đang lưu...' : editTarget ? 'Lưu' : 'Thêm'}
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
