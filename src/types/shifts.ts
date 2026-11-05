export type ShiftActionType = "CHECK_IN" | "CHECK_OUT";

export interface TeacherShiftItem {
  id: string;
  userId: string;
  teacherName: string;
  teacherDni?: string | null;
  checkIn: string;
  checkOut: string | null;
  totalMinutes: number | null;
  notes: string | null;
  createdAt: string;
}

export interface ToggleShiftResult {
  action: ShiftActionType;
  shift: TeacherShiftItem;
  teacherName: string;
  totalMinutes?: number | null;
}

export interface TeacherShiftHoursSummary {
  userId: string;
  teacherName: string;
  teacherDni?: string | null;
  totalMinutes: number;
  totalHours: number;
  shiftCount: number;
}
