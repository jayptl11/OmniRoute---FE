import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useRegister } from '@/features/auth';
import type { RegisterRequest } from '@/features/auth';

const registerSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
  username: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự.').max(50, 'Tên đăng nhập tối đa 50 ký tự.'),
  firstName: z.string().min(1, 'Vui lòng nhập họ.'),
  lastName: z.string().min(1, 'Vui lòng nhập tên.'),
  password: z
    .string()
    .min(8, 'Mật khẩu ít nhất 8 ký tự.')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa.')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường.')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số.'),
});

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister(setError);

  const onSubmit = (data: RegisterRequest) => {
    registerMutation.mutate(data);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:opacity-60';

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-bold text-slate-900 text-[15px]">OmniRoute</span>
        </div>
        <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Tạo tài khoản mới</h2>
        <p className="mt-2 text-[15px] text-slate-500">Điền thông tin để bắt đầu sử dụng.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700">
              Họ
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={inputClass}
              placeholder="Nguyễn"
            />
            {errors.firstName && (
              <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700">
              Tên
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={inputClass}
              placeholder="Văn A"
            />
            {errors.lastName && (
              <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email
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

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
            Tên đăng nhập
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className={inputClass}
            placeholder="username"
          />
          {errors.username && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={inputClass}
            placeholder="Ít nhất 8 ký tự, gồm hoa, thường, số"
          />
          {errors.password && (
            <p role="alert" className="text-[13px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-slate-900/10 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10 disabled:pointer-events-none disabled:opacity-50"
        >
          {registerMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Đang xử lý...
            </span>
          ) : (
            'Đăng ký tài khoản'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-[15px] text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
