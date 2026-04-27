import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useResetPassword } from '@/features/auth';
import type { ResetPasswordPageState } from '@/features/auth';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mật khẩu ít nhất 8 ký tự.')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa.')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường.')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số.'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResetPasswordPageState | null;

  // Guard: must have resetToken
  useEffect(() => {
    if (!state?.resetToken) {
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPassword = useResetPassword();

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!state?.resetToken) return;
    resetPassword.mutate({ resetToken: state.resetToken, newPassword: data.newPassword });
  };

  if (!state?.resetToken) return null;

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:opacity-60';

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-inner">
          <KeyRound className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
            Mật khẩu mới
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            className={inputClass}
            placeholder="Ít nhất 8 ký tự, gồm hoa, thường, số"
          />
          {errors.newPassword && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={inputClass}
            placeholder="Nhập lại mật khẩu mới"
          />
          {errors.confirmPassword && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || resetPassword.isPending}
          className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-slate-900/10 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10 disabled:pointer-events-none disabled:opacity-50"
        >
          {resetPassword.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Đang cập nhật...
            </span>
          ) : (
            'Đặt lại mật khẩu'
          )}
        </button>
      </form>
    </div>
  );
}
