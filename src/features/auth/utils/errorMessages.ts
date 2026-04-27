import type { AuthErrorCode } from '../types';

const errorMessages: Record<AuthErrorCode, string> = {
  IDENTIFIER_REQUIRED: 'Vui lòng nhập email hoặc tên đăng nhập.',
  PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu.',
  INVALID_CREDENTIALS: 'Email/tên đăng nhập hoặc mật khẩu không đúng.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',
  INVALID_EMAIL_FORMAT: 'Địa chỉ email không hợp lệ.',
  INVALID_USERNAME: 'Tên đăng nhập phải từ 3 đến 50 ký tự.',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.',
  INVALID_OTP: 'Mã OTP không hợp lệ. Vui lòng kiểm tra lại.',
  INVALID_TOKEN: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
  USER_EXISTS: 'Tài khoản với email/tên đăng nhập này đã tồn tại.',
  INVALID_PURPOSE: 'Yêu cầu không hợp lệ.',
  EMAIL_EXISTS: 'Email này đã được sử dụng.',
  USERNAME_EXISTS: 'Tên đăng nhập này đã được sử dụng.',
  OTP_RATE_LIMITED: 'Quá nhiều lần thử. Vui lòng chờ trước khi thử lại.',
  RESEND_RATE_LIMITED: 'Bạn đã yêu cầu gửi lại OTP quá nhiều lần. Vui lòng thử lại sau.',
};

export function getErrorMessage(code: string): string {
  return errorMessages[code as AuthErrorCode] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
