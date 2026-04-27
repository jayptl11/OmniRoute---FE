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
  AuthErrorCode,
} from './types';

export { authApi } from './api/authApi';
export { getErrorMessage } from './utils/errorMessages';

export { useLogin } from './hooks/useLogin';
export { useRegister } from './hooks/useRegister';
export { useVerifyOtp } from './hooks/useVerifyOtp';
export { useResendOtp } from './hooks/useResendOtp';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useResetPassword } from './hooks/useResetPassword';
export { useLogout } from './hooks/useLogout';
