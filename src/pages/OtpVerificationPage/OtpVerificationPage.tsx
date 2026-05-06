import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useVerifyOtp, useResendOtp } from '@/features/auth';
import type { OtpPageState } from '@/features/auth';
import styles from '@/layouts/AuthLayout/AuthPages.module.css';

const RESEND_COOLDOWN = 60;

export function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OtpPageState | null;

  // Guard: must arrive with email + flow in router state
  useEffect(() => {
    if (!state?.email || !state?.flow) {
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCooldown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    if (!state?.email) return;
    verifyOtp.mutate({ email: state.email, otp });
  };

  const handleResend = () => {
    if (!state?.email || cooldown > 0) return;
    resendOtp.mutate(
      { email: state.email },
      {
        onSuccess: () => {
          setOtp('');
          startCooldown();
        },
      },
    );
  };

  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  if (!state?.email) return null;

  const flowLabel = state.flow === 'register' ? 'xác thực tài khoản' : 'đặt lại mật khẩu';

  return (
    <div>
      <div className={styles.headerArea}>
        <h2 className={styles.title}>Xác thực OTP</h2>
        <p className={styles.subtitle}>
          Chúng tôi đã gửi mã {flowLabel} đến{' '}
          <strong style={{ color: '#0f172a' }}>{state.email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="otp" className={styles.label}>
            Mã OTP (6 chữ số)
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={handleOtpInput}
            className={styles.input}
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 700, fontFamily: 'monospace' }}
            placeholder="------"
            disabled={verifyOtp.isPending}
          />
        </div>

        <button
          type="submit"
          disabled={otp.length !== 6 || verifyOtp.isPending}
          className={styles.submitBtn}
        >
          {verifyOtp.isPending ? (
            <>
              <div className={styles.spinner} />
              Đang xác thực...
            </>
          ) : (
            'Xác nhận'
          )}
        </button>
      </form>

      <div className={styles.footerArea}>
        <p className={styles.footerText}>
          Không nhận được mã?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendOtp.isPending}
            className={styles.primaryLink}
            style={{ opacity: cooldown > 0 || resendOtp.isPending ? 0.5 : 1, border: 'none', background: 'none', cursor: cooldown > 0 || resendOtp.isPending ? 'not-allowed' : 'pointer' }}
          >
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại'}
          </button>
        </p>
      </div>
    </div>
  );
}
