export type AccessStatusType = "HABILITADO" | "CUOTA_VENCIDA" | "LIMITE_ALCANZADO";

export type PlanCategoryType = "MENSUAL_LIBRE" | "MENSUAL_DIAS" | "DIARIO";

export type MembershipStatusType = "ACTIVA" | "VENCIDA" | "CANCELADA";

export type PaymentMethodType = "EFECTIVO" | "TRANSFERENCIA";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
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
  expiringSoonCount: number; // cuota al día que vence en los próximos 7 días
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

// -------------------------------------------------------------
// MÉTRICAS DE ASISTENCIA (panel de la dueña)
// Una "visita" = primer ingreso HABILITADO de un socio en un día (hora local del gimnasio).
// Días de la semana en formato ISO: 1 = lunes ... 7 = domingo.
// -------------------------------------------------------------

export type AnalyticsPeriodDays = 30 | 90 | 365;

export interface HeatmapCell {
  dow: number;
  hour: number;
  avgArrivals: number;
}

export interface WeekdayAttendance {
  dow: number;
  avgVisits: number | null; // null = el gimnasio no registró actividad ese día en el período
  pctVsAverage: number | null;
}

export interface HourlyPoint {
  hour: number;
  today: number;
  typical: number;
}

export interface WeeklyTrendPoint {
  weekStart: string; // YYYY-MM-DD (lunes)
  visits: number;
}

export interface FrequencyBucket {
  label: string;
  members: number;
}

export interface AttendanceAnalytics {
  periodDays: AnalyticsPeriodDays;
  totalVisits: number;
  openDays: number;
  avgDailyVisits: number;
  heatmap: HeatmapCell[];
  peakSlots: HeatmapCell[];
  quietHours: { hour: number; avgArrivals: number }[];
  weekdays: WeekdayAttendance[];
  today: {
    dow: number;
    currentHour: number;
    visitsSoFar: number;
    typicalSoFar: number;
    pctVsTypical: number | null;
    hourly: HourlyPoint[];
  };
  weeklyTrend: WeeklyTrendPoint[];
  trendPct: number | null; // últimas 4 semanas vs las 4 anteriores
  frequency: FrequencyBucket[];
  avgVisitsPerWeek: number | null;
  rejected: { cuotaVencida: number; limiteAlcanzado: number };
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
