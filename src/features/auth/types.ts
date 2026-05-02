// ---- Request types ----

export interface RegisterRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

// ---- Response types ----

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  username: string;
  lastLogin: string | null;
  roleId: string | null;
  roleName: string | null;
}

export type OtpPurpose = 'Register' | 'ResetPassword';

export interface VerifyOtpResponse {
  purpose: OtpPurpose;
  resetToken: string | null;
  message: string | null;
}

export interface MessageResponse {
  message: string;
}

// ---- Error types ----

// OTP flow context — passed via React Router state
export type OtpFlow = 'register' | 'reset';

export interface OtpPageState {
  email: string;
  flow: OtpFlow;
}

export interface ResetPasswordPageState {
  resetToken: string;
}
