import type { NeedType, LeadStatus, LeadChannel } from './leads';

// ─── Enums / Aliases ──────────────────────────────────────────────────────────

export type { NeedType, LeadChannel };
export type { PriorityLevel } from './leads';

/** Actions that can appear in a dispatch lead's activity log */
export type DispatchActivityAction =
  | 'LEAD_CREATED'
  | 'STATUS_CHANGED'
  | 'DISPATCHED_TO_STORE';

// ─── DP-01 / DP-07: Queue ────────────────────────────────────────────────────

export interface DispatchQueueParams {
  search?: string;
  priorityLevel?: 'Low' | 'Medium' | 'High';
  addressContains?: string;
  waitedMoreThanMinutes?: number;
  page?: number;
  pageSize?: number;
}

export interface DispatchQueueItemDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  needDescription: string;
  needType: NeedType | null;
  priorityLevel: 'Low' | 'Medium' | 'High';
  waitedMinutes: number;
  createdAt: string;
}

export interface DispatchQueueResponse {
  items: DispatchQueueItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── DP-02: Lead Detail ───────────────────────────────────────────────────────

export interface DispatchActivityLogDto {
  id: string;
  action: DispatchActivityAction;
  note: string | null;
  newValue: string | null;
  performedAt: string;
  performedByName: string | null;
}

export interface DispatchLeadDetailDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string | null;
  channel: LeadChannel;
  channelDisplayName?: string | null;
  needDescription: string;
  productInterest: string[];
  needType: NeedType | null;
  priorityScore: number;
  priorityLevel: 'Low' | 'Medium' | 'High';
  assignedGroup: string;
  waitedMinutes: number;
  createdAt: string;
  updatedAt: string;
  activityLogs: DispatchActivityLogDto[];
}

// ─── DP-03: Store Capacity ────────────────────────────────────────────────────

export interface StoreCapacityDto {
  id: string;
  storeCode: string;
  storeName: string;
  address: string;
  region: string;
  managerId: string;
  maxCapacity: number;
  activeLeads: number;
  availableSlots: number;
  isOverCapacity: boolean;
  isNearCapacity: boolean;
  isActive: boolean;
}

// ─── DP-04 / DP-05: Assign Lead ──────────────────────────────────────────────

export interface AssignLeadRequest {
  storeId: string;
  note?: string;
}

export interface AssignLeadResponse {
  leadId: string;
  leadCode: string;
  assignedStoreId: string;
  storeName: string;
  assignedAt: string;
  slaDeadline: string;
}

// ─── DP-06: History ───────────────────────────────────────────────────────────

export interface DispatchHistoryItemDto {
  leadId: string;
  leadCode: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  dispatchNote: string | null;
  dispatchedAt: string;
  leadStatus: LeadStatus;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const DISPATCH_ACTIVITY_LABELS: Record<DispatchActivityAction, string> = {
  LEAD_CREATED: 'Lead được tạo',
  STATUS_CHANGED: 'Chuyển trạng thái',
  DISPATCHED_TO_STORE: 'Đã phân công về cửa hàng',
};

export const DISPATCH_LEAD_STATUS_LABELS: Partial<Record<LeadStatus, string>> = {
  Assigned: 'Đã gán — chờ xử lý',
  Contacted: 'Đã liên hệ',
  InProgress: 'Đang xử lý',
  Won: 'Chốt thành công',
  Lost: 'Không chốt được',
  Cancelled: 'Đã hủy',
};
