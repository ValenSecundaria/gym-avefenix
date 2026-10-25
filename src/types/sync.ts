import type { AccessStatusType } from "./index";

export interface CachedMember {
  id: string;
  dni: string;
  fullName: string;
  photoFilename: string | null;
  planName: string;
  allowedDays: number | null;
  validUntil: string | null;
  weeklyCheckIns: number;
}

export interface PendingCheckIn {
  id?: number;
  memberId: string;
  dni: string;
  status: AccessStatusType;
  createdAt: string;
}

export interface BatchCheckInPayload {
  memberId: string;
  status: AccessStatusType;
  createdAt: string;
}
