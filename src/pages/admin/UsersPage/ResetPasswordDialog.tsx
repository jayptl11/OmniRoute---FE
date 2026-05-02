import { useState } from 'react';
import { useSendResetLink, useSetTemporaryPassword } from '@/features/admin/hooks/useUsers';
import { extractErrorMessage } from '@/lib/errors';
import type { UserDto } from '@/types/admin';
import { X, Mail, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import styles from './UsersPage.module.css';

interface Props {
  user: UserDto;
  onClose: () => void;
}

type Mode = 'choose' | 'email' | 'temp';

export function ResetPasswordDialog({ user, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('choose');
  const [tempPwd, setTempPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const sendLink = useSendResetLink();
  const setTemp = useSetTemporaryPassword();

  const handleSendLink = async () => {
    try {
      await sendLink.mutateAsync(user.userId);
      setDone(true);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  const handleSetTemp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tempPwd || tempPwd.length < 8 || !/^[A-Z]/.test(tempPwd)) {
      setError('Mật khẩu phải dài tối thiểu 8 ký tự và bắt đầu bằng chữ viết hoa.');
      return;
    }

    try {
      await setTemp.mutateAsync({ id: user.userId, password: tempPwd });
      setDone(true);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Reset mật khẩu — {user.username}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.dialogBody}>
          {done ? (
            <div className={styles.successBanner}>
              <CheckCircle2 size={32} className={styles.successIcon} />
              <p className={styles.successTitle}>Thành công!</p>
              <p className={styles.successSub}>
                {mode === 'email'
                  ? `Đã gửi link đặt lại mật khẩu tới email ${user.email}.`
                  : 'Mật khẩu tạm thời đã được đặt. User sẽ bị yêu cầu đổi mật khẩu khi đăng nhập tiếp theo.'}
              </p>
            </div>
          ) : mode === 'choose' ? (
            <div className={styles.optionGrid}>
              <button
                className={styles.optionCard}
                onClick={() => setMode('email')}
                id="reset-option-email"
              >
                <Mail size={22} className={styles.optionIcon} />
                <span className={styles.optionLabel}>Gửi link qua email</span>
                <span className={styles.optionDesc}>
                  Hệ thống gửi link reset tới <strong>{user.email}</strong>
                </span>
              </button>
              <button
                className={styles.optionCard}
                onClick={() => setMode('temp')}
                id="reset-option-temp"
              >
                <KeyRound size={22} className={styles.optionIcon} />
                <span className={styles.optionLabel}>Đặt mật khẩu tạm thời</span>
                <span className={styles.optionDesc}>
                  Nhập thủ công mật khẩu tạm thời cho user
                </span>
              </button>
            </div>
          ) : mode === 'email' ? (
            <div>
              <p className={styles.confirmText}>
                Xác nhận gửi email reset mật khẩu tới <strong>{user.email}</strong>?
              </p>
              {error && <p className={styles.errorMsg}>{error}</p>}
            </div>
          ) : (
            <form id="form-set-temp" onSubmit={handleSetTemp}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="temp-password">Mật khẩu tạm thời</label>
                <div className={styles.pwdRow}>
                  <input
                    id="temp-password"
                    type={showPwd ? 'text' : 'password'}
                    className={styles.input}
                    required
                    minLength={8}
                    placeholder="Tối thiểu 8 ký tự, chữ hoa, thường, số"
                    value={tempPwd}
                    onChange={(e) => setTempPwd(e.target.value)}
                  />
                  <button type="button" className={styles.iconBtn} onClick={() => setShowPwd((v) => !v)}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
            </form>
          )}
        </div>

        <div className={styles.dialogFooter}>
          {done ? (
            <button className={styles.btnPrimary} onClick={onClose}>Đóng</button>
          ) : (
            <>
              <button
                className={styles.btnSecondary}
                onClick={() => (mode === 'choose' ? onClose() : setMode('choose'))}
              >
                {mode === 'choose' ? 'Huỷ' : 'Quay lại'}
              </button>
              {mode === 'email' && (
                <button
                  className={styles.btnPrimary}
                  onClick={handleSendLink}
                  disabled={sendLink.isPending}
                >
                  {sendLink.isPending ? 'Đang gửi...' : 'Gửi email'}
                </button>
              )}
              {mode === 'temp' && (
                <button
                  type="submit"
                  form="form-set-temp"
                  className={styles.btnPrimary}
                  disabled={setTemp.isPending}
                >
                  {setTemp.isPending ? 'Đang lưu...' : 'Đặt mật khẩu'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
