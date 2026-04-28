/**
 * Maps backend error codes → Vietnamese display messages for the Admin module.
 */
export const ADMIN_ERROR_MESSAGES: Record<string, string> = {
  // Users
  EMAIL_TAKEN: 'Email này đã được sử dụng bởi tài khoản khác.',
  USERNAME_TAKEN: 'Tên đăng nhập này đã tồn tại trong hệ thống.',
  USER_NOT_FOUND: 'Tài khoản không tồn tại.',
  ID_MISMATCH: 'ID trong URL và trong body không khớp.',
  WEAK_PASSWORD:
    'Mật khẩu chưa đủ mạnh (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số).',

  // Routing Rules
  DUPLICATE_PRIORITY_ORDER: 'Thứ tự ưu tiên này đã được sử dụng bởi rule khác.',
  NOT_FOUND: 'Không tìm thấy dữ liệu cần thao tác.',

  // Master Data
  CODE_TAKEN: 'Mã này đã tồn tại trong danh mục đã chọn.',
  IN_USE: 'Không thể ẩn mục này vì đang được sử dụng trong hệ thống.',

  // Stores
  STORE_CODE_TAKEN: 'Mã cửa hàng này đã tồn tại.',

  // SLA
  INVALID_WARNING_HOURS:
    'Giờ cảnh báo phải nhỏ hơn giờ tối đa (WarningBeforeHours < MaxHours).',
};

export function getAdminErrorMessage(code: string): string {
  return ADMIN_ERROR_MESSAGES[code] ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

/**
 * Extracts error code from an AppError or unknown error.
 * Handles both { errorCode } and FluentValidation { errors: { Field: ["CODE"] } } shapes.
 */
export function extractErrorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as Record<string, unknown>;
  // Standard errorCode field
  if (typeof e['code'] === 'string') return e['code'] as string;
  return null;
}
