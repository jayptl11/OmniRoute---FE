import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLogin } from '@/features/auth';
import type { LoginRequest } from '@/features/auth';
import styles from '@/layouts/AuthLayout/AuthPages.module.css';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

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
      <div className={styles.headerArea}>
        <div className={styles.mobileLogo}>
          <img src="/viettel-commerce.png" alt="Viettel Commerce" className={styles.viettelCommerceLogoMobile} />
        </div>
        <h2 className={styles.title}>Chào mừng trở lại</h2>
        <p className={styles.subtitle}>Đăng nhập để tiếp tục với tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="identifier" className={styles.label}>
            Email hoặc tên đăng nhập
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            {...register('identifier')}
            className={styles.input}
            placeholder="email@viettel.com.vn"
            disabled={isSubmitting || login.isPending}
          />
          {errors.identifier && (
            <p role="alert" className={styles.errorText}>{errors.identifier.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Quên mật khẩu?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={styles.input}
            placeholder="••••••••"
            disabled={isSubmitting || login.isPending}
          />
          {errors.password && (
            <p role="alert" className={styles.errorText}>{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || login.isPending}
          className={styles.submitBtn}
        >
          {login.isPending ? (
            <>
              <div className={styles.spinner} />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <div className={styles.footerArea}>
        <p className={styles.footerText}>
          Chưa có tài khoản?{' '}
          <Link to="/register" className={styles.primaryLink}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
