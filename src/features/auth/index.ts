// Public API for auth feature
export type {
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginResponse,
  VerifyOtpResponse,
  OtpFlow,
  OtpPageState,
  ResetPasswordPageState,
} from './types';

export { authApi } from './api/authApi';

export { useLogin } from './hooks/useLogin';
export { useRegister } from './hooks/useRegister';
export { useVerifyOtp } from './hooks/useVerifyOtp';
export { useResendOtp } from './hooks/useResendOtp';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useResetPassword } from './hooks/useResetPassword';
export { useLogout } from './hooks/useLogout';
