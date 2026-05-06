import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '@/features/auth';
import styles from '@/layouts/AuthLayout/AuthPages.module.css';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email.').email('Email không hợp lệ.'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

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
      <Link to="/login" className={styles.primaryLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
        <ArrowLeft size={16} />
        Quay lại đăng nhập
      </Link>

      <div className={styles.headerArea}>
        <h2 className={styles.title}>Quên mật khẩu?</h2>
        <p className={styles.subtitle}>
          Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={styles.input}
            placeholder="example@email.com"
            disabled={isSubmitting || forgotPassword.isPending}
          />
          {errors.email && (
            <p role="alert" className={styles.errorText}>{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || forgotPassword.isPending}
          className={styles.submitBtn}
        >
          {forgotPassword.isPending ? (
            <>
              <div className={styles.spinner} />
              Đang gửi mã...
            </>
          ) : (
            'Gửi mã xác thực'
          )}
        </button>
      </form>
    </div>
  );
}
