import type { TeacherShiftItem } from "@/types";

export function formatShift(s: {
  id: string;
  userId: string;
  checkIn: Date;
  checkOut: Date | null;
  totalMinutes: number | null;
  notes: string | null;
  createdAt: Date;
  user?: { name: string; dni: string | null } | null;
}): TeacherShiftItem {
  return {
    id: s.id,
    userId: s.userId,
    teacherName: s.user?.name ?? "",
    teacherDni: s.user?.dni ?? null,
    checkIn: s.checkIn.toISOString(),
    checkOut: s.checkOut?.toISOString() ?? null,
    totalMinutes: s.totalMinutes,
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
  };
}
