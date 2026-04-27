import { api } from '@/lib/axios';
import type {
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LogoutRequest,
  LoginResponse,
  VerifyOtpResponse,
  MessageResponse,
} from '../types';

export const authApi = {
  register: (dto: RegisterRequest) =>
    api.post<MessageResponse>('/api/auth/register', dto).then((r) => r.data),

  verifyOtp: (dto: VerifyOtpRequest) =>
    api.post<VerifyOtpResponse>('/api/auth/verify-otp', dto).then((r) => r.data),

  resendOtp: (dto: ResendOtpRequest) =>
    api.post<MessageResponse>('/api/auth/resend-otp', dto).then((r) => r.data),

  login: (dto: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login', dto).then((r) => r.data),

  forgotPassword: (dto: ForgotPasswordRequest) =>
    api.post<MessageResponse>('/api/auth/forgot-password', dto).then((r) => r.data),

  resetPassword: (dto: ResetPasswordRequest) =>
    api.post<MessageResponse>('/api/auth/reset-password', dto).then((r) => r.data),

  logout: (dto: LogoutRequest) =>
    api.post<MessageResponse>('/api/auth/logout', dto).then((r) => r.data),
};
