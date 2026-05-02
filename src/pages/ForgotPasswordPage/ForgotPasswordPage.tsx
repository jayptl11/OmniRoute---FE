import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '@/features/auth';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const inputClass =
  'w-full rounded border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:opacity-60';

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPassword = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword.mutate(data);
  };

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại đăng nhập
      </Link>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Quên mật khẩu?</h2>
        <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
          Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || forgotPassword.isPending}
          className="mt-2 w-full rounded bg-slate-900 px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {forgotPassword.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Đang gửi mã...
            </span>
          ) : (
            'Gửi mã xác thực'
          )}
        </button>
      </form>
    </div>
  );
}
