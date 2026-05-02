import { useState } from 'react';
import { useCreateUser, useUpdateUser, useRoles } from '@/features/admin/hooks/useUsers';
import { extractErrorMessage } from '@/lib/errors';
import type { UserDto, CreateUserRequest, UpdateUserRequest } from '@/types/admin';
import { X, Eye, EyeOff } from 'lucide-react';
import styles from './UsersPage.module.css';

interface Props {
  user: UserDto | null; // null = create mode
  onClose: () => void;
}

export function UserFormDialog({ user, onClose }: Props) {
  const isEdit = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    roleId: user?.roleId ?? '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEdit) {
      if (!form.password || form.password.length < 8 || !/^[A-Z]/.test(form.password)) {
        setError('Mật khẩu phải dài tối thiểu 8 ký tự và bắt đầu bằng chữ viết hoa.');
        return;
      }
      try {
        const payload: CreateUserRequest = {
          username: form.username,
          email: form.email,
          firstName: form.firstName || null,
          lastName: form.lastName || null,
          roleId: form.roleId,
          phone: form.phone || null,
          password: form.password,
        };
        await createUser.mutateAsync(payload);
        onClose();
      } catch (err: unknown) {
        setError(extractErrorMessage(err));
      }
    } else {
      try {
        const payload: UpdateUserRequest = {
          userId: user.userId,
          firstName: form.firstName || null,
          lastName: form.lastName || null,
          email: form.email,
          roleId: form.roleId || user.roleId,
        };
        await updateUser.mutateAsync({ id: user.userId, data: payload });
        onClose();
      } catch (err: unknown) {
        setError(extractErrorMessage(err));
      }
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>
            {isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="user-firstName">
                  Họ <span className={styles.optional}>(tùy chọn)</span>
                </label>
                <input
                  id="user-firstName"
                  className={styles.input}
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="user-lastName">
                  Tên <span className={styles.optional}>(tùy chọn)</span>
                </label>
                <input
                  id="user-lastName"
                  className={styles.input}
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                />
              </div>
            </div>

            {!isEdit && (
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="user-username">Username *</label>
                <input
                  id="user-username"
                  className={styles.input}
                  required
                  minLength={3}
                  maxLength={50}
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="user-email">Email *</label>
              <input
                id="user-email"
                type="email"
                className={styles.input}
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="user-role">Role *</label>
              <select
                id="user-role"
                className={styles.input}
                required
                value={form.roleId}
                onChange={(e) => set('roleId', e.target.value)}
                disabled={rolesLoading}
              >
                <option value="">{rolesLoading ? 'Đang tải...' : '— Chọn role —'}</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>
              {isEdit && (
                <p className={styles.cellMuted} style={{ marginTop: 4, fontSize: '0.75rem' }}>
                  Role hiện tại: <strong>{user.roleName}</strong>
                </p>
              )}
            </div>

            {!isEdit && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="user-password">Mật khẩu *</label>
                  <div className={styles.pwdRow}>
                    <input
                      id="user-password"
                      type={showPwd ? 'text' : 'password'}
                      className={styles.input}
                      required
                      minLength={8}
                      maxLength={100}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                    />
                    <button type="button" className={styles.iconBtn} onClick={() => setShowPwd((v) => !v)}>
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="user-phone">
                    Số điện thoại <span className={styles.optional}>(tùy chọn)</span>
                  </label>
                  <input
                    id="user-phone"
                    className={styles.input}
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}
          </div>

          <div className={styles.dialogFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isPending || rolesLoading}>
              {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
