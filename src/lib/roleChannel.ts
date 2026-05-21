export const ROLE_LABELS = {
  TV: 'Nhân viên tư vấn',
  SA: 'Nhân viên sale',
  CS: 'Nhân viên chăm sóc khách hàng',
  DP: 'Nhân viên điều phối',
  TN: 'Trưởng nhóm / giám sát vận hành',
  QL: 'Quản lý cửa hàng',
  QT: 'Quản trị hệ thống',
  BQL: 'Ban quản lý',
  SS: 'Nhân viên sale cửa hàng',
} as const;

export const CHANNEL_VALUES = [
  'Hotline',
  'Walkin',
  'Webform',
  'Chat',
  'Email',
  'Zalo',
  'Referral',
] as const;

export type ChannelValue = (typeof CHANNEL_VALUES)[number];

export const CHANNEL_LABELS: Record<ChannelValue, string> = {
  Hotline: 'Hotline',
  Walkin: 'Trực tiếp tại cửa hàng',
  Webform: 'Biểu mẫu web',
  Chat: 'Chat',
  Email: 'Email',
  Zalo: 'Zalo',
  Referral: 'Giới thiệu',
};

export function getRoleLabel(
  roleName?: string | null,
  roleDisplayName?: string | null,
): string {
  if (roleDisplayName) {
    return roleDisplayName;
  }

  if (!roleName) {
    return '-';
  }

  return ROLE_LABELS[roleName as keyof typeof ROLE_LABELS] ?? roleName;
}

export function getChannelLabel(
  channel?: string | null,
  channelDisplayName?: string | null,
): string {
  if (channelDisplayName) {
    return channelDisplayName;
  }

  if (!channel) {
    return '-';
  }

  return CHANNEL_LABELS[channel as ChannelValue] ?? channel;
}
