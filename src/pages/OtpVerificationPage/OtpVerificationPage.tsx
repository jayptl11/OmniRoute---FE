import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { useVerifyOtp, useResendOtp } from '@/features/auth';
import type { OtpPageState } from '@/features/auth';

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
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-inner">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Xác thực OTP</h2>
        <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
          Chúng tôi đã gửi mã {flowLabel} đến{' '}
          <span className="font-semibold text-slate-900">{state.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-semibold text-slate-700">
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:opacity-60 font-mono"
            placeholder="------"
          />
        </div>

        <button
          type="submit"
          disabled={otp.length !== 6 || verifyOtp.isPending}
          className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-slate-900/10 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10 disabled:pointer-events-none disabled:opacity-50"
        >
          {verifyOtp.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Đang xác thực...
            </span>
          ) : (
            'Xác nhận'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[15px] text-slate-500">
          Không nhận được mã?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendOtp.isPending}
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline disabled:pointer-events-none disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại'}
          </button>
        </p>
      </div>
    </div>
  );
}
