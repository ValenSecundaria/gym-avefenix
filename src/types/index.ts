export type AccessStatusType = "HABILITADO" | "CUOTA_VENCIDA" | "LIMITE_ALCANZADO";

export type PlanCategoryType = "MENSUAL_LIBRE" | "MENSUAL_DIAS" | "DIARIO";

export type MembershipStatusType = "ACTIVA" | "VENCIDA" | "CANCELADA";

export type PaymentMethodType = "EFECTIVO" | "TRANSFERENCIA";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CheckInVerificationResult {
  memberId: string;
  dni: string;
  fullName: string;
  photoUrl: string | null;
  status: AccessStatusType;
  planName?: string;
  validUntil?: string | null;
  daysUsedThisWeek?: number;
  allowedDaysPerWeek?: number | null;
  checkedInAt: string;
}

export interface DashboardStats {
  todayCheckIns: number;
  activeMembers: number;
  debtorsCount: number;
  absentCount: number;
  monthlyRevenue: number;
}

export interface LiveCheckInItem {
  id: string;
  memberId: string;
  dni: string;
  fullName: string;
  photoUrl: string | null;
  planName: string;
  status: AccessStatusType;
  createdAt: string;
}

export interface DebtorMemberItem {
  id: string;
  dni: string;
  fullName: string;
  phone: string | null;
  photoUrl: string | null;
  membershipId: string | null;
  planId: string | null;
  planName: string;
  planPrice: number;
  validUntil: string | null;
  daysOverdue: number;
}

export interface AbsentMemberItem {
  id: string;
  dni: string;
  fullName: string;
  phone: string | null;
  photoUrl: string | null;
  planName: string;
  lastCheckInAt: string | null;
  daysAbsent: number;
}

export interface PlanOption {
  id: string;
  name: string;
  category: PlanCategoryType;
  allowedDaysPerWeek: number | null;
  durationDays: number;
  price: number;
}

export interface MemberListItem {
  id: string;
  dni: string;
  fullName: string;
  phone: string | null;
  photoFilename: string | null;
  photoUrl: string | null;
  isActive: boolean;
  planName: string;
  membershipStatus: MembershipStatusType | "SIN_MEMBRESIA";
  validUntil: string | null;
}
