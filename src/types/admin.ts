// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Sent as integer to API, received as string from API */
export enum AssignedGroup {
  Sale = 0,
  Cskh = 1,
  StoreSupport = 2,
}

export type AssignedGroupString = 'Sale' | 'Cskh' | 'StoreSupport';

export enum Channel {
  Hotline = 'Hotline',
  Walkin = 'Walkin',
  Webform = 'Webform',
  Chat = 'Chat',
  Email = 'Email',
  Zalo = 'Zalo',
  Referral = 'Referral',
}

export enum NeedType {
  SaleNew = 'SaleNew',
  SaleUpgrade = 'SaleUpgrade',
  SaleRenew = 'SaleRenew',
  CskhSupport = 'CskhSupport',
  CskhComplaint = 'CskhComplaint',
  CskhWarranty = 'CskhWarranty',
  StoreVisit = 'StoreVisit',
  Other = 'Other',
}

export enum MasterDataCategory {
  Product = 0,
  LostReason = 1,
  CancelReason = 2,
}

export type MasterDataCategoryString = 'Product' | 'LostReason' | 'CancelReason';

export type PriorityLevel = 'Low' | 'Medium' | 'High';

export interface RoleDto {
  roleId: string;
  roleName: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserDto {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
  roleId: string;
  storeId: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface GetUsersParams {
  roleName?: string;
  storeId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roleId: string;
  storeId?: string | null;
  phone?: string | null;
  password: string;
}

export interface CreateUserResponse {
  userId: string;
  username: string;
  email: string;
}

export interface UpdateUserRequest {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  roleId: string;
  storeId?: string | null;
}

export interface ToggleUserStatusResponse {
  userId: string;
  isActive: boolean;
  activeLeadCount: number;
}

// ─── Routing Rules ────────────────────────────────────────────────────────────

export interface RoutingRuleDto {
  id: string;
  ruleName: string;
  description: string | null;
  priorityOrder: number;
  conditionChannels: string[] | null;
  conditionKeywords: string[] | null;
  actionGroup: AssignedGroupString;
  actionTeamId: string | null;
  actionTeamName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleRequest {
  ruleName: string;
  description?: string | null;
  priorityOrder: number;
  conditionChannels?: string[] | null;
  conditionKeywords?: string[] | null;
  actionGroup: number; // send as integer
  actionTeamId?: string | null;
}

export interface UpdateRuleRequest extends CreateRuleRequest {}

export interface TestRuleRequest {
  needDescription?: string | null;
  channel?: string | null;
}

export interface TestRuleResponse {
  matched: boolean;
  matchedRuleId: string | null;
  matchedRuleName: string | null;
  matchedPriorityOrder: number | null;
  resultGroup: AssignedGroupString;
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export interface MasterDataItemDto {
  id: string;
  category: MasterDataCategoryString;
  code: string;
  displayName: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface GetMasterDataParams {
  category?: MasterDataCategory;
  isActive?: boolean;
}

export interface CreateMasterDataRequest {
  category: MasterDataCategory; // send as integer
  code: string;
  displayName: string;
  description?: string | null;
  sortOrder: number;
}

export interface UpdateMasterDataRequest {
  displayName: string;
  description?: string | null;
  sortOrder: number;
}

export interface EnumValueDto {
  value: string;
  displayName: string;
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export interface StoreDto {
  id: string;
  storeCode: string;
  storeName: string;
  address: string | null;
  region: string | null;
  managerId: string | null;           // uuid — QL hiện tại
  managerName: string | null;         // tên đầy đủ QL (null nếu chưa có)
  managerUsername: string | null;     // username QL (null nếu chưa có)
  maxCapacity: number;
  isActive: boolean;
  createdAt: string;
}

/** Kết quả tìm kiếm QL để gán làm quản lý (API 1) */
export interface StoreManagerDto {
  userId: string;
  fullName: string;
  username: string;
  hasStore: boolean;               // đang quản lý cửa hàng khác
  currentStore: string | null;     // tên cửa hàng hiện tại
}

export interface GetStoresParams {
  search?: string;
  region?: string;
  isActive?: boolean;
}

export interface CreateStoreRequest {
  storeCode: string;
  storeName: string;
  maxCapacity: number;
  address?: string | null;
  region?: string | null;
  managerUsername?: string | null; // username của QL (không phải id)
}

export interface UpdateStoreRequest {
  id: string;
  storeName: string;
  maxCapacity: number;
  address?: string | null;
  region?: string | null;
  managerUsername?: string | null; // null → xóa quản lý hiện tại
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface TeamDto {
  id: string;
  teamName: string;
  teamType: AssignedGroupString;
  leaderId: string | null;
  leaderName: string | null;   // tên đầy đủ của TN được gán (nếu API trả về)
  storeId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GetTeamsParams {
  teamType?: AssignedGroup;
  storeId?: string;
  isActive?: boolean;
}

export interface CreateTeamRequest {
  teamName: string;
  teamType: number; // 0=Sale, 1=Cskh
  leaderId?: string | null;
  storeId?: string | null;
}

export interface UpdateTeamRequest {
  id: string;
  teamName: string;
  leaderId?: string | null;
  storeId?: string | null;
}

// ─── SLA Config ───────────────────────────────────────────────────────────────

export interface SlaConfigDto {
  id: string;
  assignedGroup: AssignedGroupString;
  priorityLevel: PriorityLevel;
  maxHours: number;
  warningBeforeHours: number;
  isActive: boolean;
}

export interface UpdateSlaConfigRequest {
  maxHours: number;
  warningBeforeHours: number;
}

// ─── Toggle Status (generic) ──────────────────────────────────────────────────
export interface ToggleStatusRequest {
  isActive: boolean;
}
