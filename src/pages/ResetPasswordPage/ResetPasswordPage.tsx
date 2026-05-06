import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetPassword } from '@/features/auth';
import type { ResetPasswordPageState } from '@/features/auth';
import styles from '@/layouts/AuthLayout/AuthPages.module.css';

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

  return (
    <div>
      <div className={styles.headerArea}>
        <h2 className={styles.title}>Đặt lại mật khẩu</h2>
        <p className={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            Mật khẩu mới
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            className={styles.input}
            placeholder="Ít nhất 8 ký tự, gồm hoa, thường, số"
            disabled={isSubmitting || resetPassword.isPending}
          />
          {errors.newPassword && (
            <p role="alert" className={styles.errorText}>{errors.newPassword.message}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            disabled={isSubmitting || resetPassword.isPending}
          />
          {errors.confirmPassword && (
            <p role="alert" className={styles.errorText}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || resetPassword.isPending}
          className={styles.submitBtn}
        >
          {resetPassword.isPending ? (
            <>
              <div className={styles.spinner} />
              Đang cập nhật...
            </>
          ) : (
            'Đặt lại mật khẩu'
          )}
        </button>
      </form>
    </div>
  );
}
