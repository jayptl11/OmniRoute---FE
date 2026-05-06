import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useRegister } from '@/features/auth';
import type { RegisterRequest } from '@/features/auth';
import styles from '@/layouts/AuthLayout/AuthPages.module.css';

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
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterRequest) => {
    registerMutation.mutate(data);
  };

  return (
    <div>
      <div className={styles.headerArea}>
        <div className={styles.mobileLogo}>
          <img src="/viettel-commerce.png" alt="Viettel Commerce" className={styles.viettelCommerceLogoMobile} />
        </div>
        <h2 className={styles.title}>Tạo tài khoản mới</h2>
        <p className={styles.subtitle}>Điền thông tin để bắt đầu sử dụng.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              Họ
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={styles.input}
              placeholder="Nguyễn"
              disabled={isSubmitting || registerMutation.isPending}
            />
            {errors.firstName && (
              <p role="alert" className={styles.errorText}>{errors.firstName.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Tên
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={styles.input}
              placeholder="Văn A"
              disabled={isSubmitting || registerMutation.isPending}
            />
            {errors.lastName && (
              <p role="alert" className={styles.errorText}>{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={styles.input}
            placeholder="example@email.com"
            disabled={isSubmitting || registerMutation.isPending}
          />
          {errors.email && (
            <p role="alert" className={styles.errorText}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            Tên đăng nhập
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className={styles.input}
            placeholder="username"
            disabled={isSubmitting || registerMutation.isPending}
          />
          {errors.username && (
            <p role="alert" className={styles.errorText}>{errors.username.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={styles.input}
            placeholder="Ít nhất 8 ký tự, gồm hoa, thường, số"
            disabled={isSubmitting || registerMutation.isPending}
          />
          {errors.password && (
            <p role="alert" className={styles.errorText}>{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className={styles.submitBtn}
        >
          {registerMutation.isPending ? (
            <>
              <div className={styles.spinner} />
              Đang xử lý...
            </>
          ) : (
            'Đăng ký tài khoản'
          )}
        </button>
      </form>

      <div className={styles.footerArea}>
        <p className={styles.footerText}>
          Đã có tài khoản?{' '}
          <Link to="/login" className={styles.primaryLink}>
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
