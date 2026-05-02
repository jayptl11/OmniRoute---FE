import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLogin } from '@/features/auth';
import type { LoginRequest } from '@/features/auth';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

const inputCls =
  'w-full rounded border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:opacity-60';

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const login = useLogin();

  const onSubmit = (data: LoginRequest) => {
    login.mutate(data);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-bold text-slate-900 text-[15px]">OmniRoute</span>
        </div>
        <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Chào mừng trở lại</h2>
        <p className="mt-2 text-[15px] text-slate-500">Đăng nhập để tiếp tục với tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700">
            Email hoặc tên đăng nhập
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            {...register('identifier')}
            className={inputCls}
            placeholder="email@viettel.com.vn"
          />
          {errors.identifier && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="text-[13px] font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={inputCls}
            placeholder="••••••••"
          />
          {errors.password && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || login.isPending}
          className="mt-2 w-full rounded bg-slate-900 px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {login.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Đang đăng nhập...
            </span>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-[15px] text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
